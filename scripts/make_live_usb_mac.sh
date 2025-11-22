#!/usr/bin/env bash
# make_live_usb_mac.sh
# Usage: ./make_live_usb_mac.sh /path/to/linuxmint.iso diskN
# Example: ./make_live_usb_mac.sh ~/Downloads/linuxmint-22.2-cinnamon-64bit.iso disk4
set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Usage: $0 /path/to/linuxmint.iso diskN"
  exit 2
fi

ISO="$1"
TARGET_DISK="$2"

if [[ ! -f "$ISO" ]]; then
  echo "ERROR: ISO not found: $ISO" >&2
  exit 1
fi

echo "About to overwrite /dev/${TARGET_DISK} with $ISO"
echo "Confirm the target disk (type the disk node again to proceed):"
read -p "Target disk node (e.g. disk4): " confirm
if [[ "$confirm" != "$TARGET_DISK" ]]; then
  echo "Disk mismatch; aborting."
  exit 1
fi

echo "Unmounting /dev/${TARGET_DISK}..."
diskutil unmountDisk /dev/${TARGET_DISK}

echo "Writing $ISO -> /dev/rd${TARGET_DISK} (raw device) — this may take several minutes"
sudo dd if="$ISO" of=/dev/rd${TARGET_DISK} bs=1m status=progress conv=sync

echo "Syncing..."
sync

echo "Ejecting /dev/${TARGET_DISK}..."
diskutil eject /dev/${TARGET_DISK}

echo "Live USB created. Boot the PC from this USB (use your PC one-time boot menu)."
