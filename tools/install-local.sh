#!/usr/bin/env bash
set -euo pipefail

# Installs this repository's Oh My Zsh configuration as your active zsh profile.
# Usage: ./tools/install-local.sh [theme]
# If a theme name is provided, the script will set ZSH_THEME to that value in ~/.zshrc.

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TEMPLATE="$REPO_DIR/templates/zshrc.zsh-template"

if [ ! -f "$TEMPLATE" ]; then
  echo "Error: template not found at $TEMPLATE" >&2
  exit 1
fi

BACKUP_DIR="$HOME/.oh-my-zsh-backups"
mkdir -p "$BACKUP_DIR"

if [ -f "$HOME/.zshrc" ]; then
  ts=$(date +%s)
  cp "$HOME/.zshrc" "$BACKUP_DIR/.zshrc.$ts"
  echo "Backed up existing ~/.zshrc -> $BACKUP_DIR/.zshrc.$ts"
fi

cp "$TEMPLATE" "$HOME/.zshrc"

# Replace default ZSH path in the copied file with the absolute repo path.
# Works for the template which defines: export ZSH="$HOME/.oh-my-zsh"
if grep -q 'export ZSH="\$HOME/.oh-my-zsh"' "$HOME/.zshrc"; then
  # Use portable sed: create a backup then remove it
  sed -i.bak "s|export ZSH=\"\$HOME/.oh-my-zsh\"|export ZSH=\"$REPO_DIR\"|" "$HOME/.zshrc"
  rm -f "$HOME/.zshrc.bak"
fi

# Optionally set theme
if [ "$#" -ge 1 ]; then
  THEME="$1"
  if grep -q '^ZSH_THEME=' "$HOME/.zshrc"; then
    sed -i.bak "s/^ZSH_THEME=.*/ZSH_THEME=\"$THEME\"/" "$HOME/.zshrc"
    rm -f "$HOME/.zshrc.bak"
  else
    echo "ZSH_THEME=\"$THEME\"" >> "$HOME/.zshrc"
  fi
  echo "Set ZSH_THEME to '$THEME' in ~/.zshrc"
fi

echo "Ensuring repository custom theme wrapper exists..."
if [ -f "$REPO_DIR/custom/themes/spaceship.zsh-theme" ]; then
  echo "Found wrapper theme: custom/themes/spaceship.zsh-theme"
fi

echo "Installation complete. To activate now run: exec zsh"
echo "If you want to set Spaceship as your theme now run: ./tools/install-local.sh spaceship"

exit 0
