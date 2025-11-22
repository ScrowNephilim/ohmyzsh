#!/usr/bin/env bash
set -euo pipefail

# Installer: apply this repository's Oh My Zsh config to the current user
# - backs up existing ~/.zshrc and ~/.oh-my-zsh (if present)
# - copies templates/zshrc.zsh-template -> ~/.zshrc
# - updates ZSH to point at the repo and sets theme to "spaceship"
# - does not remove any files; always creates backups

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TIMESTAMP="$(date +%Y%m%d%H%M%S)"

ZSHRC="$HOME/.zshrc"
OH_MY_ZSH_DIR="$HOME/.oh-my-zsh"

echo "Repository: $REPO_DIR"

echo "Step 1: Backing up existing files (if present)"
if [[ -f "$ZSHRC" ]]; then
  cp -a "$ZSHRC" "$ZSHRC.ohmyzsh.bak.$TIMESTAMP"
  echo "- Backed up $ZSHRC -> $ZSHRC.ohmyzsh.bak.$TIMESTAMP"
fi
if [[ -d "$OH_MY_ZSH_DIR" ]]; then
  mv "$OH_MY_ZSH_DIR" "$OH_MY_ZSH_DIR.ohmyzsh.bak.$TIMESTAMP"
  echo "- Moved $OH_MY_ZSH_DIR -> $OH_MY_ZSH_DIR.ohmyzsh.bak.$TIMESTAMP"
fi

TEMPLATE="$REPO_DIR/templates/zshrc.zsh-template"
if [[ ! -f "$TEMPLATE" ]]; then
  echo "Error: template $TEMPLATE not found" >&2
  exit 1
fi

echo "Step 2: Installing new ~/.zshrc from template"
cp -a "$TEMPLATE" "$ZSHRC"

# Update the export ZSH line to point at this repo
# Handle variations like export ZSH="$HOME/.oh-my-zsh" or export ZSH="$HOME/.oh-my-zsh"
if grep -q '^export ZSH=' "$ZSHRC"; then
  sed -i.bak".$TIMESTAMP" "s|^export ZSH=.*|export ZSH=\"$REPO_DIR\"|" "$ZSHRC"
  rm -f "$ZSHRC.bak.$TIMESTAMP"
else
  echo "export ZSH=\"$REPO_DIR\"" >> "$ZSHRC"
fi

# Set theme to spaceship
if grep -q '^ZSH_THEME=' "$ZSHRC"; then
  sed -i.bak".$TIMESTAMP" "s/^ZSH_THEME=.*/ZSH_THEME=\"spaceship\"/" "$ZSHRC"
  rm -f "$ZSHRC.bak.$TIMESTAMP"
else
  echo "ZSH_THEME=\"spaceship\"" >> "$ZSHRC"
fi

# Ensure ZSH_CUSTOM points to $ZSH/custom (optional explicit export)
if ! grep -q '^export ZSH_CUSTOM=' "$ZSHRC"; then
  echo "export ZSH_CUSTOM=\"\$ZSH/custom\"" >> "$ZSHRC"
fi

# Inform about the wrapper theme we added
WRAPPER_THEME="$REPO_DIR/custom/themes/spaceship.zsh-theme"
if [[ -f "$WRAPPER_THEME" ]]; then
  echo "Step 3: Spaceship wrapper theme present: $WRAPPER_THEME"
else
  echo "Warning: wrapper theme $WRAPPER_THEME is not present. You may need to create a symlink or clone spaceship into $REPO_DIR/custom/spaceship-prompt." >&2
fi

echo "Step 4: Ensure $REPO_DIR/custom/spaceship-prompt/spaceship.zsh-theme exists"
if [[ -f "$REPO_DIR/custom/spaceship-prompt/spaceship.zsh-theme" ]]; then
  echo "- Found spaceship theme in custom/spaceship-prompt"
else
  echo "- Not found: please clone spaceship-prompt into $REPO_DIR/custom/spaceship-prompt or install it into $REPO_DIR/custom/themes." >&2
fi

# Step 5: Append recommended Spaceship configuration for custom sections
echo "Step 5: Appending spaceship custom sections configuration to $ZSHRC"
cat >> "$ZSHRC" <<'ZSHCONFIG'
# --- spaceship: custom sections (1password, stronghold, chatbots) ---
# Colors (defaults)
: ${SPACESHIP_1PASSWORD_COLOR:='magenta'}
: ${SPACESHIP_STRONGHOLD_COLOR:='cyan'}
: ${SPACESHIP_CHATBOTS_COLOR:='yellow'}

# Prefix/suffix defaults for these modules
# - prefix: empty by default (no extra leading text)
# - suffix: default to $SPACESHIP_PROMPT_DEFAULT_SUFFIX when present
: ${SPACESHIP_1PASSWORD_PREFIX:=''}
: ${SPACESHIP_1PASSWORD_SUFFIX:=$SPACESHIP_PROMPT_DEFAULT_SUFFIX}
: ${SPACESHIP_STRONGHOLD_PREFIX:=''}
: ${SPACESHIP_STRONGHOLD_SUFFIX:=$SPACESHIP_PROMPT_DEFAULT_SUFFIX}
: ${SPACESHIP_CHATBOTS_PREFIX:=''}
: ${SPACESHIP_CHATBOTS_SUFFIX:=$SPACESHIP_PROMPT_DEFAULT_SUFFIX}

# Recommended SPACESHIP_PROMPT_ORDER (insert modules after git when possible)
if [[ -z "${SPACESHIP_PROMPT_ORDER-}" ]]; then
  SPACESHIP_PROMPT_ORDER=(user dir host git 1password stronghold chatbots vcs exec_time line_sep battery char vi_mode status)
else
  new_order="$SPACESHIP_PROMPT_ORDER"
  for m in 1password stronghold chatbots; do
    if [[ "$new_order" != *"$m"* ]]; then
      if [[ "$new_order" = *"git"* ]]; then
        new_order="${new_order/git/git $m}"
      else
        new_order="$new_order $m"
      fi
    fi
  done
  SPACESHIP_PROMPT_ORDER=(${(s: :)new_order})
fi
# --- end spaceship custom sections ---
ZSHCONFIG
# --- ensure spaceship contrib integrations get sourced in users' ~/.zshrc ---
if ! grep -q 'Source spaceship contrib integrations' "$ZSHRC"; then
  cat >> "$ZSHRC" <<'ZSHINT'
# Source spaceship contrib integrations (1password/stronghold/chatbots)
if [[ -f "${ZSH_CUSTOM:-$ZSH/custom}/spaceship-prompt/contrib/enable-integrations.zsh" ]]; then
  source "${ZSH_CUSTOM:-$ZSH/custom}/spaceship-prompt/contrib/enable-integrations.zsh"
fi
ZSHINT
fi


cat <<'EOF'
Done. To finish:

1) Open a new Terminal window or run:

   exec zsh

2) If the prompt looks garbled, install a Nerd/Powerline font and select it in your Terminal/iTerm preferences.
   Example: https://github.com/ryanoasis/nerd-fonts

3) If you want to restore your previous config:
   - ~/.zshrc.ohmyzsh.bak.<timestamp>
   - ~/.oh-my-zsh.ohmyzsh.bak.<timestamp>

Notes:
- This script uses the repository as your live $ZSH directory. If you'd rather install a separate copy under ~/.oh-my-zsh, run the official installer or copy the repo to ~/.oh-my-zsh instead.
EOF

exit 0
