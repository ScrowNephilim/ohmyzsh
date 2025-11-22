# Oh My Zsh – Copilot Instructions
## Load Order & Layout
- `oh-my-zsh.sh` is the only sanctioned entrypoint: it bails on non-zsh shells/emulation, sets `ZSH`, `ZSH_CUSTOM`, `ZSH_CACHE_DIR`, sources `tools/check_for_upgrade.sh`, then builds `fpath` before any user code.
- `_omz_source` (in `oh-my-zsh.sh`) autoloads `lib/*.zsh`, tracking contexts like `lib:git` so `zstyle ':omz:<context>' aliases off` can temporarily disable plugin aliases—ensure new libs respect that pattern.
- Completion state lives in `$ZSH_CACHE_DIR/completions` and `ZSH_COMPDUMP-*`; the loader rewrites the dump whenever the git revision or `fpath` changes, so refresh logic around the metadata comments must stay intact.
- `$ZSH_CUSTOM/**` mirrors the stock tree and wins on load order; never assume files only exist inside `$ZSH` and keep overrides backward-compatible.
- Vendored projects (`spaceship-prompt/`, `awesome-*`, `codefuse-chatbot/`, `mitaka/`) are not auto-sourced—edit them only when intentionally working in those subprojects.

## Plugins & Custom Code
- Plugins must provide `plugins/<name>/<name>.plugin.zsh` (or `_name` completion) plus a README describing aliases/env vars; the loader uses `is_plugin` to guard `fpath` updates before `compinit` runs.
- Users list plugins in `.zshrc` via whitespace (`plugins=(git bundler dotenv)`), so scripts like `lib/cli.zsh` → `omz plugin enable|disable` rely on simple whitespace edits—do not introduce comma-separated formats.
- Custom plugins live under `$ZSH_CUSTOM/plugins`; name collisions prefer user code. Keep plugin logic lazy (define aliases/functions, avoid executing heavy binaries at source time) so `omz reload` stays fast.
- Alias additions must follow `CONTRIBUTING.md` (“widely useful, minimal overlap”); when in doubt, gate aliases with zstyles or config variables so power users can opt out.

## Themes & Prompt Pipeline
- Themes are single `.zsh-theme` files in `themes/` that set `PROMPT/RPROMPT` and call helpers from `lib/git.zsh`, `lib/prompt_info_functions.zsh`, or `lib/async_prompt.zsh`; keep git prompts resilient by using `git_prompt_info` wrappers (already export `GIT_OPTIONAL_LOCKS=0`).
- Respect dynamic selection: `ZSH_THEME="robbyrussell"` is default, `ZSH_THEME="random"` honors `ZSH_THEME_RANDOM_CANDIDATES` and `ZSH_THEME_RANDOM_IGNORED`. `omz theme list|set|use` already resolves `$ZSH_CUSTOM/themes`.
- Async segments should hook into `lib/async_prompt.zsh` instead of spawning new background jobs—reuse `_omz_async_init` so cancellation works on slower git repos.

## CLI & Tooling Workflows
- `lib/cli.zsh` implements the `omz` command (`omz plugin …`, `omz theme …`, `omz update`, `omz pr test <id>`). Extend those subcommands rather than adding new entrypoints so docs, completions, and tests stay in sync.
- `omz pr test` clones PR branches under `$ZSH/cache/prs`; new workflows should plug into this flow so maintainers can reproduce reports quickly.
- Install/upgrade scripts in `tools/install.sh`, `tools/upgrade.sh`, `tools/uninstall.sh` are POSIX `/bin/sh`; document new flags near the top comments and remember they honor env vars like `ZSH`, `RUNZSH`, `CHSH`, `KEEP_ZSHRC`.
- Default config scaffolding lives in `templates/zshrc.zsh-template` (and `templates/minimal.zshrc`); update these whenever you add user-facing vars or aliases so fresh installs pick them up.

## Tests & Verification
- CI (`.github/workflows/main.yml`) runs `zsh -n` against `oh-my-zsh.sh`, every `lib/*.zsh`, `plugins/*/{*.plugin.zsh,_*}`, and `themes/*.zsh-theme`. Reproduce locally before sending PRs to catch parse errors.
- `lib/tests/cli.test.zsh` drives regression tests for `omz plugin/theme/...`; run with `zsh -df lib/tests/cli.test.zsh` whenever editing CLI text processing.
- For plugins/themes touching external CLIs, add usage docs with reproducible steps (ideally a tiny script under the plugin dir) so `omz pr test` users can validate quickly.

## Contribution Conventions
- Follow Conventional Commits (`type(scope): subject`); scopes for plugins/themes must match their directory name (`fix(git): …`). Breaking changes require the `!` marker plus a short migration note.
- Stick to POSIX shell in `tools/*.sh` and vendor installers; reserve zsh features for `.zsh`/`.zsh-theme` files.
- Reuse helpers instead of shelling out (`omz_urlencode`, `omz_urldecode`, `lib/git.zsh` functions, `lib/history.zsh` wrappers) and avoid hard-coding `$HOME`—reference `$ZSH`, `$ZSH_CUSTOM`, or `$ZDOTDIR` so overrides continue to work.
