---
name: user-dotfiles-tool-config
description: Diagnose and modify dotfiles tool configurations including tmux, zsh, nix, homebrew, and statusline. Used when a tool is misbehaving, a new feature needs configuring, or setup scripts need updating.
allowed-tools: Bash, Read, Glob, Grep, Edit, Write, Agent
---

<objective>
Maintain and improve the personal dotfiles toolchain: tmux, zsh plugins, nix/brew package management, statusline, and setup scripts. Covers diagnosing broken configs, adding new features, and keeping setup scripts current.

Observed pattern: 9+ sessions in 60 days follow this shape — user reports a tool not working or wants a feature, Claude diagnoses via Bash/Glob, edits config files, and tests the result.
</objective>

<quick_start>
Trigger phrases:
- "[tool]が起動しない / 動かなくなってる"
- "statuslineに[feature]を表示したい"
- "[tool]の設定を調整したい"
- "Fix [tool] configuration"
- "Add [feature] to [tool]"

Data sources:
- `~/dotfiles/home/config/` — XDG config files (tmux, zsh, yazi, etc.)
- `~/dotfiles/setup/` — Setup scripts
- `~/dotfiles/nix/` — Nix packages and darwin config
- `~/dotfiles/setup/Brewfile` — Homebrew packages
</quick_start>

<workflow>
<phase_1>
**Phase 1: Diagnose**

1. Identify the tool and symptom from user description
2. Read the relevant config file(s):
   - tmux: `~/dotfiles/home/config/tmux/tmux.conf` (may not exist — tmux is launched via `tmuximum`; check `~/dotfiles/home/config/zsh/63_tmux.zsh` and `~/dotfiles/home/config/sheldon/plugins.toml` instead)
   - zsh: `~/dotfiles/home/config/zsh/` (`.zshrc`, plugins)
   - statusline: check tmux status-right/status-left config (if tmux.conf doesn't exist, it needs to be created first)
   - yazi: `~/dotfiles/home/config/yazi/`
   - If the expected config file is absent: check whether the tool is launched via a wrapper (zsh script, sheldon plugin) before concluding the config is missing
3. Run diagnostic commands:
   - `[tool] --version` — verify installation
   - Check if the config file is being sourced/symlinked correctly
   - Look for error messages in startup logs
4. Check setup scripts for how the tool was installed:
   - Glob: `~/dotfiles/setup/*.sh`
   - Check Brewfile or nix flake.nix
</phase_1>

<phase_2>
**Phase 2: Identify Root Cause**

Common patterns:
- **Symlink broken**: setup/04_symlinks.sh may need re-running
- **Package not installed**: check Brewfile or nix config
- **Config syntax error**: validate with tool's check command
- **Version change**: tool updated, config needs adjustment
- **Startup hook error**: check Claude Code hook scripts if tmux/zsh related

Verify the symlink chain:
```bash
ls -la ~/.config/[tool]
ls -la ~/dotfiles/home/config/[tool]
```
</phase_2>

<phase_3>
**Phase 3: Apply Fix**

1. Edit the relevant config file in `~/dotfiles/home/config/` (not the symlink target)
   - If creating a new config directory (e.g., `tmux/`), also add a symlink entry in `~/dotfiles/setup/04_symlinks.sh`
2. If adding a new package, identify the correct manager:
   - Homebrew formula → `~/dotfiles/setup/Brewfile`
   - Nix package → `~/dotfiles/nix/hosts/common.nix`
   - Zsh plugin → `~/dotfiles/home/config/sheldon/plugins.toml`
   (Ask the user if unsure — adding a zsh plugin to Brewfile is a silent no-op)
3. If adding a setup step: update the relevant `~/dotfiles/setup/NN_*.sh` script
4. Keep changes minimal — edit only what is needed
5. Abstract any personal paths if the change goes into a shared script

Testing:
- Source the config: `source ~/.zshrc` or `tmux source ~/.config/tmux/tmux.conf`
- Restart the tool if sourcing is not sufficient
- For statusline: verify the display with `tmux` directly
</phase_3>

<phase_4>
**Phase 4: Verify and Document**

1. Confirm the fix works (user or Claude verifies the tool behavior)
2. If the change affects setup scripts: note that `./setup/setup.sh` would apply it on fresh install
3. Summarize: what was broken, what was changed, how to verify
</phase_4>
</workflow>

<success_criteria>
- [ ] Root cause identified (not just symptoms masked)
- [ ] Config files in `~/dotfiles/home/` edited (not symlink targets)
- [ ] Fix tested and confirmed working
- [ ] If package-level change: Brewfile or nix config updated
- [ ] No unnecessary changes to unrelated configs
</success_criteria>
