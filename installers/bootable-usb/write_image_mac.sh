#!/usr/bin/env bash
set -euo pipefail

# write_image_mac.sh
# Safely write an image (iso/img) to a USB drive on macOS using dd.
# Usage: sudo ./write_image_mac.sh /path/to/image.iso
# The script will list disks, prompt for the target disk (e.g. disk2), unmount it, write to /dev/rdiskN, sync, and eject.

if [[ $EUID -ne 0 ]]; then
  echo "This script must be run with sudo: sudo $0 /path/to/image" >&2
  exit 2
fi

IMAGE=${1:-}
if [[ -z "$IMAGE" ]]; then
  echo "Usage: sudo $0 /path/to/image.iso" >&2
  exit 2
fi

if [[ ! -f "$IMAGE" ]]; then
  echo "Image file not found: $IMAGE" >&2
  exit 2
fi

echo "Image: $IMAGE"

echo
echo "Attached disks (you will write to a device like /dev/disk2):"
diskutil list

echo
read -rp "Enter the target disk identifier (example: disk2) — DO NOT include partition (e.g. disk2s1): " TARGET_DISK

if [[ -z "$TARGET_DISK" ]]; then
  echo "No disk selected, aborting." >&2
  exit 1
fi

# Confirm
read -rp "You are about to WRITE the image to /dev/$TARGET_DISK and DESTROY its contents. Type 'YES' to continue: " CONFIRM
if [[ "$CONFIRM" != "YES" ]]; then
  echo "Aborted by user." >&2
  exit 1
fi

# Unmount the disk
echo "Unmounting /dev/$TARGET_DISK..."
diskutil unmountDisk "/dev/$TARGET_DISK"

# Use raw disk for faster write (rdisk)
RAW_DEVICE="/dev/r${TARGET_DISK}"
if [[ ! -b "$RAW_DEVICE" && ! -e "$RAW_DEVICE" ]]; then
  # fallback to /dev/diskN if raw device not present
  RAW_DEVICE="/dev/${TARGET_DISK}"
fi

echo "Writing to $RAW_DEVICE — this may take a while."

# Determine best block size (1m recommended on macOS)
BS=1m

# Use dd with progress where available. macOS dd has status=progress on newer versions; fall back gracefully.
if dd --version >/dev/null 2>&1; then
  # GNU dd may exist; use status=progress
  dd if="$IMAGE" of="$RAW_DEVICE" bs=$BS conv=sync status=progress
else
  # BSD dd usually on macOS; many modern macOS versions support status=progress
  dd if="$IMAGE" of="$RAW_DEVICE" bs=$BS conv=sync
fi

# Ensure data flushed
sync

# Eject the disk
diskutil eject "/dev/$TARGET_DISK" || true

echo "Write complete. You can now boot from the USB device (if your machine supports it)."

exit 0
