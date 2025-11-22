Install this repository's Oh My Zsh configuration into your macOS account

Overview

This small helper copies `templates/zshrc.zsh-template` to `~/.zshrc`, updates `ZSH` to point at this repository, sets `ZSH_THEME="spaceship"`, and ensures `ZSH_CUSTOM` points at the repo's `custom/` folder. It also backs up your existing `~/.zshrc` and `~/.oh-my-zsh` if present.

Usage

From the repository root run:

```bash
# make the script executable once
chmod +x scripts/install_repo_zsh.sh

# run installer (it will create backups)
scripts/install_repo_zsh.sh
```

After the script completes reload your shell:

```bash
exec zsh
```

Troubleshooting

- If the prompt prints strange glyphs, install a Nerd font and select it in Terminal/iTerm.
- If `spaceship` isn't found, ensure `custom/spaceship-prompt/spaceship.zsh-theme` exists, or clone `https://github.com/spaceship-prompt/spaceship-prompt` into `custom/`.
- To restore previous config, files are backed up as `~/.zshrc.ohmyzsh.bak.<timestamp>` and `~/.oh-my-zsh.ohmyzsh.bak.<timestamp>`.

Security & Notes

- The script modifies files in your home directory — review it before running.
- The script uses this repo as the active `$ZSH`. If you prefer a separate install under `~/.oh-my-zsh`, copy the repo to that location instead.
