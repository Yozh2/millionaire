#!/usr/bin/env bash
# Batch convert OGG (Vorbis) -> M4A (AAC-LC) with safe replacement.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
PUBLIC_DIR="$PROJECT_ROOT/public"

convert_dir () {
  local root="$1"
  local subdir="$2"
  local bitrate="$3"
  local channels="$4" # "keep" or number

  while IFS= read -r -d '' f; do
    local base="${f%.*}"
    local tmp="${base}.m4a.tmp"
    local out="${base}.m4a"

    local -a ch_args=()
    if [[ "$channels" != "keep" ]]; then
      ch_args=(-ac "$channels")
    fi

    if (( ${#ch_args[@]} > 0 )); then
      ffmpeg -nostdin -hide_banner -loglevel error -y \
        -i "$f" \
        "${ch_args[@]}" \
        -af "alimiter=limit=0.99" \
        -c:a aac -profile:a aac_low -b:a "$bitrate" \
        -movflags +faststart \
        -f mp4 \
        "$tmp"
    else
      ffmpeg -nostdin -hide_banner -loglevel error -y \
        -i "$f" \
        -af "alimiter=limit=0.99" \
        -c:a aac -profile:a aac_low -b:a "$bitrate" \
        -movflags +faststart \
        -f mp4 \
        "$tmp"
    fi

    if [[ -s "$tmp" ]]; then
      mv -f "$tmp" "$out"
      rm -f "$f"
    else
      echo "Error: failed to create $out"
      exit 1
    fi
  done < <(find "$root" -type f -regex ".*/${subdir}/.*\\.ogg$" -print0)
}

echo "Converting OGG assets under $PUBLIC_DIR/games..."

convert_dir "$PUBLIC_DIR/games" "music" "112k" "keep"
convert_dir "$PUBLIC_DIR/games" "sounds" "64k" "keep"
convert_dir "$PUBLIC_DIR/games" "voices" "96k" "1"

echo "Done."
