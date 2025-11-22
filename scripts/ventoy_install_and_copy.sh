#!/usr/bin/env bash
# ventoy_install_and_copy.sh
# Usage (interactive):
# 1) Boot PC with Mint live USB created earlier.
# 2) Place this script on the live environment (e.g. another USB) and run: sudo ./ventoy_install_and_copy.sh
#
# This script will:
# - download Ventoy linux tarball (v1.1.07)
# - prompt you to confirm the target device (destructive)
# - install Ventoy to target (Ventoy2Disk.sh -i /dev/sdX)
# - mount Ventoy data partition and copy ISOs and oh-my-zsh repo if available
# - attempt to fetch drivers for Gigabyte AB350-Gaming, AMD chipset, NVIDIA GTX1080, Realtek/Bluetooth
# - write a manifest of downloads into the Ventoy drivers folder
# - sync and unmount the Ventoy partition
set -euo pipefail

VENTOY_VER="1.1.07"
VENTOY_TARBALL="ventoy-${VENTOY_VER}-linux.tar.gz"
VENTOY_URL="https://github.com/ventoy/Ventoy/releases/download/v${VENTOY_VER}/ventoy-${VENTOY_VER}-linux.tar.gz"

TMPDIR="/tmp/ventoy_install_$$"
mkdir -p "$TMPDIR"
cd "$TMPDIR"

echo "1) Downloading Ventoy ${VENTOY_VER}..."
if ! curl -L -o "$VENTOY_TARBALL" "$VENTOY_URL"; then
  echo "Failed to download Ventoy from $VENTOY_URL" >&2
  exit 1
fi
tar xzf "$VENTOY_TARBALL"
VENTOY_DIR=$(find . -maxdepth 1 -type d -name "ventoy-*" | head -n1)
if [[ -z "$VENTOY_DIR" ]]; then
  echo "Failed to extract Ventoy archive." >&2
  exit 1
fi
cd "$VENTOY_DIR"

echo
echo "2) Confirm target device (VERY DESTRUCTIVE). This will erase the entire selected physical device."
echo "List block devices now:"
lsblk -o NAME,MODEL,SIZE,TYPE,MOUNTPOINT,LABEL

read -p $'\nEnter target device node (example /dev/sdb) — this is the PHYSICAL device that will become Ventoy: ' TARGET
if [[ ! -b "$TARGET" ]]; then
  echo "ERROR: $TARGET is not a block device. Aborting." >&2
  exit 2
fi

echo "You entered: $TARGET"
read -p "Type the exact device node again to CONFIRM (uppercase YES to proceed): " CONF
if [[ "$CONF" != "YES" ]]; then
  echo "Confirmation not given. Aborting."
  exit 3
fi

echo
echo "3) Installing Ventoy to $TARGET (this WILL ERASE $TARGET). Running Ventoy2Disk.sh -i $TARGET"
sudo ./Ventoy2Disk.sh -i "$TARGET"

echo "Ventoy install finished. Now detect Ventoy data partition and mount it."
# find likely data partition (usually target + '1' or '2')
DEVNAME=$(basename "$TARGET")
PART=""
for p in /dev/${DEVNAME}*; do
  if [[ "$p" == "$TARGET" ]]; then continue; fi
  if lsblk -no FSTYPE "$p" | grep -qiE 'vfat|exfat|ntfs|fat32|msdos|ntfs'; then
    PART="$p"
    break
  fi
done
if [[ -z "$PART" ]]; then
  PART=$(ls "${TARGET}"* | sed -n '2p' || true)
fi
if [[ -z "$PART" ]]; then
  echo "Could not determine Ventoy data partition automatically." >&2
  echo "Run 'lsblk' and mount the correct Ventoy partition manually (mount /dev/sdX1 /mnt/ventoy), then copy files."
  exit 10
fi

echo "Mounting Ventoy data partition $PART -> /mnt/ventoy"
mkdir -p /mnt/ventoy
sudo mount "$PART" /mnt/ventoy

echo "4) Copy ISOs and repository to Ventoy data partition."
read -p "If your ISOs and repo are on a second USB or external path, enter the mount path here (e.g. /media/mint/USB), or leave empty to skip: " SRC_DIR
if [[ -n "$SRC_DIR" && -d "$SRC_DIR" ]]; then
  echo "Copying ISOs from $SRC_DIR to /mnt/ventoy ..."
  find "$SRC_DIR" -maxdepth 2 -type f \( -iname '*.iso' -o -iname '*.img' \) -print0 | while IFS= read -r -d '' iso; do
    echo "Copying: $iso"
    cp -v "$iso" /mnt/ventoy/ || echo "failed to copy $iso"
  done
  if [[ -d "$SRC_DIR/ohmyzsh" ]]; then
    echo "Copying oh-my-zsh repo from $SRC_DIR/ohmyzsh to /mnt/ventoy/OH_MY_ZSH"
    cp -a "$SRC_DIR/ohmyzsh" /mnt/ventoy/OH_MY_ZSH || echo "copy repo failed"
  fi
else
  echo "No valid source directory given or path missing; skipping automatic ISO copy. You can manually copy files to /mnt/ventoy now."
fi

echo
echo "5) Fetching model-specific drivers (best-effort). Drivers will be saved to /mnt/ventoy/drivers/"
DRIVERS_DIR="/mnt/ventoy/drivers"
mkdir -p "$DRIVERS_DIR"
MANIFEST="$DRIVERS_DIR/manifest.txt"
echo "Driver manifest" > "$MANIFEST"
date -u >> "$MANIFEST"
echo "" >> "$MANIFEST"

fetch_file() {
  local url="$1"
  local out="$2"
  echo "Fetching $url ..."
  echo "SOURCE: $url" >> "$MANIFEST"
  if curl -L -f -C - -o "$out" "$url"; then
    echo "Saved: $out" >> "$MANIFEST"
  else
    echo "FAILED: $url" >> "$MANIFEST"
  fi
  echo "" >> "$MANIFEST"
}

# Gigabyte support page
GIG_PAGE="https://www.gigabyte.com/Motherboard/GA-AB350-Gaming-rev-1x/support#download"
TMP_HTML="/tmp/gigabyte_ab350.html"
curl -L -sS "$GIG_PAGE" -o "$TMP_HTML" || echo "Warning: failed to fetch Gigabyte page (may be blocked)."
if [[ -f "$TMP_HTML" ]]; then
  grep -Eoi 'https?://[^\"\'>]+(zip|exe|7z|msi|cab)' "$TMP_HTML" | sort -u | while read -r link; do
    base=$(basename "$link" | sed 's/[?].*//')
    fetch_file "$link" "$DRIVERS_DIR/$base"
  done
fi

# AMD chipset page
AMD_PAGE="https://www.amd.com/en/support/chipsets/amd-socket-am4"
TMP_AMD="/tmp/amd_chipset.html"
curl -L -sS "$AMD_PAGE" -o "$TMP_AMD" || echo "Warning: failed to fetch AMD page."
if [[ -f "$TMP_AMD" ]]; then
  grep -Eoi 'https?://[^\"\'>]+(zip|exe|msi|cab|tar.gz)' "$TMP_AMD" | sort -u | while read -r link; do
    base=$(basename "$link" | sed 's/[?].*//')
    fetch_file "$link" "$DRIVERS_DIR/$base"
  done
fi

# NVIDIA (best-effort)
NVIDIA_QUERY_URL="https://www.nvidia.com/Download/processDriver.aspx?psid=101&pfid=880&rpf=1&osid=57&lid=1"
TMP_NVI="/tmp/nvidia_page.html"
curl -L -sS "$NVIDIA_QUERY_URL" -o "$TMP_NVI" || echo "Warning: failed to fetch NVIDIA driver page."
if [[ -f "$TMP_NVI" ]]; then
  grep -Eoi 'https?://[^\"\'>]+(exe|zip)' "$TMP_NVI" | sort -u | while read -r link; do
    base=$(basename "$link" | sed 's/[?].*//')
    fetch_file "$link" "$DRIVERS_DIR/$base"
  done
fi

# Realtek
REALTEK_PAGE="https://www.realtek.com/en/downloads"
TMP_RTK="/tmp/realtek.html"
curl -L -sS "$REALTEK_PAGE" -o "$TMP_RTK" || echo "Warning: failed to fetch Realtek page."
if [[ -f "$TMP_RTK" ]]; then
  grep -Eoi 'https?://[^\"\'>]+(zip|exe|msi|cab|7z)' "$TMP_RTK" | sort -u | while read -r link; do
    base=$(basename "$link" | sed 's/[?].*//')
    fetch_file "$link" "$DRIVERS_DIR/$base"
  done
fi

echo "Driver download manifest written to: $MANIFEST"
echo ""

echo "6) Finalize: sync and unmount Ventoy partition"
sync
sudo umount /mnt/ventoy || sudo umount "$PART" || true

echo "Ventoy install + driver fetch complete. Ventoy device: $TARGET"
echo "Manifest and downloaded files are on the Ventoy partition under /drivers/manifest.txt"
