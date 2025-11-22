# Bootable USB Install Assets

Use this folder to store everything needed to flash Linux installation media onto a USB drive.

## Suggested layout

```
installers/bootable-usb/
├── isos/          # Distribution ISOs you’ve downloaded
├── checksums/     # SHA256/SHA512 checksum files
├── notes/         # Text files describing tweaks or post-install steps
└── scripts/       # Helper scripts (e.g., wrapper around `dd` or `balena-cli`)
```

## Workflow

1. **Download & verify**
   - Place ISOs in `isos/` and matching checksum files in `checksums/`.
   - Run `shasum -a 256 isos/<file>.iso` (or distro-provided tool) and compare.

2. **Prepare the USB target**
   - Identify the device (e.g., `/dev/disk3` on macOS, `/dev/sdX` on Linux) and unmount any mounted partitions.
   - Document the device path in `notes/DEVICE.md` so you avoid accidental overwrites.

3. **Write the image**
   - Use your preferred tool, e.g.:
     ```sh
     sudo dd if=isos/<file>.iso of=/dev/sdX bs=4M status=progress oflag=sync
     ```
   - Alternatively, place reusable commands in `scripts/write-image.zsh` and reference them here.

4. **Post-flash verification**
   - Re-mount the USB read-only and confirm expected files exist.
   - Record any manual tweaks (adding kickstart files, persistence partitions, etc.) inside `notes/`.

Keeping these assets version-controlled makes it easy to recreate identical boot media whenever you need to reinstall Linux or help someone else do so.
