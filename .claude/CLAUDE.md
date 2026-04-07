# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

This file supplements the global CLAUDE.md. If there is a conflict, this file takes priority.

## Commands

```bash
./setup/setup.sh            # Run full setup
mise run macos:check        # Detect macOS defaults changes
mise run macos:apply        # Apply macOS settings
bun scripts/development/lint-format.ts  # oxlint + dprint + shfmt + shellcheck

# Nix (package management)
cd nix && ./update-nixpkgs.sh            # Update nixpkgs (1-week delay, gets stable version)
cd nix && ./update-nixpkgs.sh --days 14  # Change the delay in days
cd nix && darwin-rebuild switch --flake . # Apply Nix packages
cd nix && darwin-rebuild switch --rollback # Rollback
```

## Directory Structure

```
home/             # Deploy source templates → symlinked to ~/ by setup/04_symlinks.sh
  .claude/        # Claude Code config (agents, rules, skills, hooks) → ~/.claude/
  config/         # XDG config (ghostty, nvim, yazi, zsh, etc.) → ~/.config/
nix/              # Nix package management (nix-darwin + flakes, aarch64-darwin)
  flake.nix       # Entry point (auto-detects all hosts from hosts/)
  flake.lock      # Version lock (auto-generated, committed to git)
  hosts/          # Per-host config (common.nix + host-specific)
setup/            # Numbered setup scripts (01-04 base, 10 dev, 20 AI)
  Brewfile        # Homebrew package definitions (GUI / not yet migrated to Nix)
scripts/          # Dev and ops tools (TypeScript/Bun)
  development/    # lint-format, compare-dirs, etc.
  git/            # Custom git commands
  media/          # Image and video conversion tools
  system/         # macOS settings, SSH, ZIP, etc.
.claude/          # Runtime state (sessions, memory, plans) — gitignored
```

## Toolchain

- **Runtime:** Bun
- **Task runner:** mise
- **Lint:** oxlint (TS/JS), shellcheck (shell)
- **Format:** dprint (MD/YAML/TOML) + shfmt (shell)
- **Zsh plugin manager:** sheldon
- **Packages:** Nix (nix-darwin, CLI tools) + Homebrew (setup/Brewfile, GUI / not yet migrated to Nix)

## Design Principles

macOS only. Personal use. Public GitHub repository. No need to consider Linux/Windows compatibility, multi-user support, or enterprise requirements.

### 1. macOS-Only Assumption

- Use BSD commands as-is (`stat -f%z`, `readlink`, `grep -E`, etc.)
- Use built-in features of the macOS default zsh
- No need to check for GNU coreutils or add portability branches

### 2. YAGNI (You Aren't Gonna Need It)

Do not implement features you do not plan to use tomorrow. Avoid over-abstraction and over-generalization. Write the minimum code that works.

### 3. Pragmatism First (80% Rule)

- Covering 80% of use cases is enough
- No need to cover all edge cases, add perfect error handling, or write very detailed logs
- Example: basic check only for timeouts, basic sanitize only for path validation

## Security Policy

Personal environment. Single user. No need to handle TOCTOU, privilege escalation, or race conditions.

- **Credential protection**: .gitignore + `chmod 600` + `umask 077`
- **Input validation**: Basic sanitize (`${value//[^a-zA-Z0-9_-]/}`) is enough
- Detailed threat modeling and defense-in-depth are overkill

## Test Policy

Manual testing only. Do not introduce automated testing (CI/CD, bats-core, etc.).
