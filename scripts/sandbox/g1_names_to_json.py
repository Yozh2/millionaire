import sys
from pathlib import Path

import re
import pandas as pd



def make_id(us_name: str) -> str:
    if pd.isna(us_name):
        return ""
    first = str(us_name).split("/")[0].strip()
    first = first.lower()
    # "слова слиты воедино" + убираем дефисы/пробелы/прочие символы
    first = re.sub(r"[^a-z0-9]+", "", first)
    return first


def make_meta(season) -> str:
    try:
        s = int(float(season))
    except Exception:
        return ""
    return f"G1 s{s}"


def esc(s) -> str:
    """Экранируем одинарные кавычки и backslash для безопасного вывода."""
    if pd.isna(s):
        return ""
    return str(s).replace("\\", "\\\\").replace("'", "\\'")


def to_ts_like_companions(df: pd.DataFrame) -> str:
    lines = ["companions: ["]
    for _, row in df.iterrows():
        id_ = esc(row["id"])
        name = esc(row["RU Name"])
        desc = esc(row["US Name"])
        meta = esc(row["meta"])

        line = (
            f"  {{ id: '{id_}', name: '{name}', desc: '{desc}', meta: '{meta}' }},"
        )

        t = row.get("Type", "")
        if isinstance(t, str) and t.strip():
            line += f" // {t.strip()}"

        lines.append(line)

    lines.append("]")
    return "\n".join(lines)


def main(csv_path: str):
    df = pd.read_csv(csv_path)

    # Оставляем только реальные строки персонажей
    df = df[df["Team"].isin(["Autobot", "Decepticon"])].copy()

    # Вычисляем поля
    df["id"] = df["US Name"].apply(make_id)
    df["meta"] = df["Season"].apply(make_meta)

    # Порядок: сначала Autobots, потом Decepticons — без сортировки
    autobots = df[df["Team"] == "Autobot"]
    decepticons = df[df["Team"] == "Decepticon"]
    ordered = pd.concat([autobots, decepticons], ignore_index=True)

    text = to_ts_like_companions(ordered)
    # Save to output file
    output_path = Path(csv_path).with_suffix(".output.ts")
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)

if __name__ == "__main__":
    # Если запустишь без аргумента — использует путь к твоему загруженному файлу
    DEFAULT_PATH = Path(__file__).resolve().parent / "G1_translations.csv"
    path = sys.argv[1] if len(sys.argv) > 1 else str(DEFAULT_PATH)
    main(path)
