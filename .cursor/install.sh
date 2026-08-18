#!/usr/bin/env bash
# Cloud Agent install for the agent-skills repo.
#
# The repo is Markdown skills plus one executable: the english-coach Claude Code
# plugin hook (plugins/english-coach/scripts/improve-prompt.ts), which runs under
# Bun. ripgrep, Node, git, and curl already ship in the base image and cover the
# authoring + AGENTS.md verification loop, so Bun is the only extra toolchain to
# install here. Idempotent: safe to re-run and safe when booting from a snapshot
# that already has Bun.
set -euo pipefail

if ! command -v bun >/dev/null 2>&1 && [ ! -x "$HOME/.bun/bin/bun" ]; then
  export BUN_INSTALL="$HOME/.bun"
  curl -fsSL https://bun.sh/install | bash
fi

# Expose Bun on a stable PATH for non-interactive agent shells (the installer
# only edits shell profiles, which non-interactive shells do not source).
if [ -x "$HOME/.bun/bin/bun" ]; then
  if command -v sudo >/dev/null 2>&1; then
    sudo ln -sf "$HOME/.bun/bin/bun" /usr/local/bin/bun
  else
    ln -sf "$HOME/.bun/bin/bun" /usr/local/bin/bun
  fi
fi

echo "Toolchain versions:"
echo "  bun:  $(bun --version)"
echo "  node: $(node --version)"
echo "  rg:   $(rg --version | head -1)"
