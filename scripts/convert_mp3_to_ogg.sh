#!/bin/zsh
# Скрипт для конвертации MP3 в OGG Vorbis
# Параметры: 128kbps, 44100Hz, стерео, без метаданных

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PUBLIC_DIR="$SCRIPT_DIR/../public"

echo "Ищу MP3 файлы в $PUBLIC_DIR..."

mp3_files=($(find "$PUBLIC_DIR" -name "*.mp3" -type f 2>/dev/null))

if [[ ${#mp3_files[@]} -eq 0 ]]; then
    echo "MP3 файлы не найдены."
    exit 0
fi

echo "Найдено ${#mp3_files[@]} MP3 файл(ов):"
printf '%s\n' "${mp3_files[@]}"
echo ""

for f in "${mp3_files[@]}"; do
    ogg_file="${f%.mp3}.ogg"
    echo "Конвертирую: $f -> $ogg_file"

    ffmpeg -y -i "$f" \
        -map 0:a \
        -c:a libvorbis \
        -b:a 128k \
        -ar 44100 \
        -ac 2 \
        -map_metadata -1 \
        "$ogg_file" 2>&1 | grep -E "(Duration|size=)" || true

    if [[ -f "$ogg_file" ]]; then
        rm -v "$f"
    else
        echo "Ошибка: не удалось создать $ogg_file"
        exit 1
    fi
done

echo ""
echo "Готово! Сконвертировано ${#mp3_files[@]} файл(ов)."
