# Plan for Restoring Zsh Prompts on Linux

1. **Choose Linux Distribution**
   - Start with Linux Mint 21.3 (Cinnamon) unless another distro is required; Ubuntu 24.04 LTS or Fedora 41 remain fallback options.
   - Download the ISO from the official site and verify checksum.

2. **Create Bootable USB**
   - Use Balena Etcher or Rufus (GPT + UEFI); let the tool reimage the drive automatically, and only pre-format manually if needed—in that case pick GPT + FAT32 (not exFAT/HFS+).
   - Flash the verified ISO onto the USB stick.

3. **Install Linux on the New SSD**
   - Boot from USB, install Linux using the guided partitioner (EFI + root + optional home/swap).
   - Confirm SSD health via SMART tools once Linux is installed.

4. **Set Up Zsh Environment**
   - Install zsh (`sudo apt install zsh` or distro equivalent) and set it as default shell.
   - Clone or copy `~/.oh-my-zsh/` plus any `$ZSH_CUSTOM` plugins/themes from backups.
   - Restore `.zshrc`, ensuring plugin lists and environment variables reference Linux paths.
   - After restoring the framework, ensure `oh-my-zsh.sh` remains the sole entrypoint: source it once to verify it exports `ZSH`, `ZSH_CUSTOM`, and `ZSH_CACHE_DIR`, sources `tools/check_for_upgrade.sh`, and rebuilds `fpath` before any user code.

5. **Install Supporting Tools**
   - Reinstall dependencies used by prompts (e.g., `git`, `fzf`, `exa`, `powerlevel10k`, fonts).
   - Install Powerline/Nerd Fonts system-wide so prompt glyphs render correctly.

6. **Validate Prompts**
   - Launch a new zsh session, verify prompt segments load without errors.
   - If plugins reference macOS-only binaries, swap in Linux equivalents or guard with conditionals.
   - Inspect `$ZSH_CACHE_DIR/completions` and any `ZSH_COMPDUMP-*` files (e.g., via `omz reload`) to confirm completions regenerate cleanly whenever the git revision or `fpath` changes.

7. **Optional Dual Boot Preparation**
   - If planning to reinstall Windows later, shrink Linux partition with `gparted`.
   - Use Linux tools (e.g., `WoeUSB`) to create a fresh Windows installer when ready.

8. **Backup & Iterate**
   - Keep a copy of the working `.zshrc` and custom themes/plugins in version control.
   - Document any Linux-specific tweaks for future migrations.
   - Track custom plugin/theme or CLI tweaks (especially anything under `$ZSH_CUSTOM`) in a repo, noting any `omz` command changes so future restores and `lib/tests/cli.test.zsh` runs stay reproducible.
