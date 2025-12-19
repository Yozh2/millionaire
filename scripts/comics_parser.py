#!/usr/bin/env python3
"""
Скрипт:
- берёт список ссылок из LINKS_TEXT,
- парсит Synopsis и Featured characters на лету,
- сохраняет результат в Markdown файл на диске.

Требуется:
    pip install requests beautifulsoup4
"""

from __future__ import annotations

import sys
from pathlib import Path
from typing import List, Optional

import requests
from bs4 import BeautifulSoup

OUTPUT_FILE = "transformers_comics.md"

# ВСТАВЬ СВОЙ СПИСОК ССЫЛОК СЮДА (многострочный plaintext)
LINKS_TEXT = """
https://tfwiki.net/wiki/Megatron_Origin_issue_1
https://tfwiki.net/wiki/Megatron_Origin_issue_2
https://tfwiki.net/wiki/Megatron_Origin_issue_3
https://tfwiki.net/wiki/Megatron_Origin_issue_4
""".strip()


def extract_section_text(
    soup: BeautifulSoup,
    section_title: str,
    extra_tags: Optional[List[str]] = None,
) -> Optional[str]:
    """
    Находит <h2> с нужным заголовком и собирает текст до следующего <h2>.
    extra_tags — доп. теги, которые тоже включаем (например, div).
    """
    if extra_tags is None:
        extra_tags = []

    header = None
    for h2 in soup.find_all("h2"):
        text = h2.get_text(strip=True)
        if text == section_title:
            header = h2
            break

    if header is None:
        return None

    allowed_tags = {"p", "ul", "ol", "li"}
    allowed_tags.update(extra_tags)

    parts: List[str] = []

    for sibling in header.next_siblings:
        name = getattr(sibling, "name", None)
        if name == "h2":
            break
        if name in allowed_tags:
            text = " ".join(sibling.get_text(" ", strip=True).split())
            if text:
                parts.append(text)

    if not parts:
        return None

    return "\n\n".join(parts)


def build_markdown_fragment(url: str, html_text: str) -> str:
    """
    Делает markdown-фрагмент для одной страницы: заголовок, Synopsis,
    Featured characters (если найдены).
    """
    soup = BeautifulSoup(html_text, "html.parser")

    h1 = soup.find("h1")
    if not h1:
        return f"<!-- No <h1> title found for {url} -->\n"

    title = " ".join(h1.get_text(" ", strip=True).split())

    synopsis = extract_section_text(soup, "Synopsis")
    featured = extract_section_text(
        soup,
        "Featured characters",
        extra_tags=["div"],
    )

    lines: List[str] = []
    lines.append(f"# {title}")
    lines.append("")
    lines.append(f"<!-- Source: {url} -->")
    lines.append("")

    if synopsis:
        lines.append("## Synopsis")
        lines.append("")
        lines.append(synopsis)
        lines.append("")
    else:
        lines.append("<!-- Synopsis section not found -->")
        lines.append("")

    if featured:
        lines.append("## Featured characters")
        lines.append("")
        lines.append(featured)
        lines.append("")
    else:
        lines.append("<!-- Featured characters section not found -->")
        lines.append("")

    return "\n".join(lines)


def main() -> int:
    links = [link.strip() for link in LINKS_TEXT.splitlines() if link.strip()]
    if not links:
        print("No links in LINKS_TEXT.", file=sys.stderr)
        return 1

    output_path = Path(OUTPUT_FILE)
    fragments: List[str] = []

    for idx, url in enumerate(links, start=1):
        print(f"[{idx}/{len(links)}] Processing: {url}", file=sys.stderr)

        try:
            response = requests.get(url, timeout=20)
            response.raise_for_status()

            fragment = build_markdown_fragment(url, response.text)
            fragments.append(fragment)
            print("  ✓ Parsed successfully", file=sys.stderr)

        except requests.RequestException as e:
            print(f"  ✗ FAILED: {e}", file=sys.stderr)
            fragments.append(f"<!-- FAILED to process {url}: {e} -->\n")

    # Склеиваем в один Markdown и записываем в файл
    output = "\n---\n\n".join(fragments)
    output_path.write_text(output, encoding="utf-8")

    print(f"\n✓ Saved to {output_path.absolute()}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
