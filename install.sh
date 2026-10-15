#!/usr/bin/env bash
# Memasang semua skill di folder skills/ ke folder skill pribadi Claude Code.
#
#   ./install.sh          # symlink (default): `git pull` di repo ini langsung memperbarui skill
#   ./install.sh --copy   # salin file (pakai jika symlink tidak didukung); ulangi setelah `git pull`
#   ./install.sh --uninstall
#
# Target: $CLAUDE_SKILLS_DIR jika di-set, selain itu ~/.claude/skills
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}"
MODE="link"
case "${1:-}" in
  --copy) MODE="copy" ;;
  --uninstall) MODE="uninstall" ;;
  "") ;;
  *) echo "Opsi tidak dikenal: $1" >&2; exit 2 ;;
esac

mkdir -p "$TARGET"

for skill_dir in "$REPO_DIR"/skills/*/; do
  name="$(basename "$skill_dir")"
  dest="$TARGET/$name"
  [ -f "$skill_dir/SKILL.md" ] || { echo "lewati $name (tidak ada SKILL.md)"; continue; }

  if [ "$MODE" = "uninstall" ]; then
    if [ -L "$dest" ] || [ -f "$dest/.installed-from-agentconfig-template" ]; then
      rm -rf "$dest"; echo "dihapus  $dest"
    else
      echo "lewati   $dest (bukan hasil install ini)"
    fi
    continue
  fi

  # Jangan menimpa skill lain yang kebetulan bernama sama.
  if [ -e "$dest" ] && [ ! -L "$dest" ] && [ ! -f "$dest/.installed-from-agentconfig-template" ]; then
    if [ -d "$dest/.git" ]; then
      echo "PERINGATAN: $dest adalah clone lama (sebelum repo multi-skill). Hapus dulu: rm -rf \"$dest\"" >&2
    else
      echo "PERINGATAN: $dest sudah ada dan bukan dari repo ini — dilewati." >&2
    fi
    continue
  fi

  rm -rf "$dest"
  if [ "$MODE" = "link" ]; then
    ln -s "${skill_dir%/}" "$dest"
    echo "symlink  $dest -> ${skill_dir%/}"
  else
    cp -R "${skill_dir%/}" "$dest"
    touch "$dest/.installed-from-agentconfig-template"
    echo "salin    $dest"
  fi
done

[ "$MODE" = "uninstall" ] || echo "Selesai. Restart Claude Code, lalu cek dengan /agentconfig dan /prd-writer."
