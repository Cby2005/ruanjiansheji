import argparse
import re
from pathlib import Path

import pandas as pd


def clean_text(text: str) -> str:
    text = str(text or "")
    patterns = [
        r"责任编辑[:：].*$",
        r"打印本页.*$",
        r"关闭窗口.*$",
        r"版权所有.*$",
        r"ICP备案.*$",
    ]
    for pattern in patterns:
        text = re.sub(pattern, "", text, flags=re.M)
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def chunk_text(text: str, chunk_size: int, overlap: int) -> list[str]:
    text = clean_text(text)
    if not text:
        return []
    chunks = []
    start = 0
    while start < len(text):
        end = min(start + chunk_size, len(text))
        split = max(text.rfind("。", start, end), text.rfind("\n", start, end))
        if split > start + int(chunk_size * 0.55):
            end = split + 1
        chunks.append(text[start:end].strip())
        if end >= len(text):
            break
        start = max(0, end - overlap)
    return [chunk for chunk in chunks if chunk]


def main() -> None:
    parser = argparse.ArgumentParser(description="Clean agri article CSV and create RAG chunks.")
    parser.add_argument("--input", default="./output/agri_articles.csv")
    parser.add_argument("--output", default="./output")
    parser.add_argument("--chunk-size", type=int, default=800)
    parser.add_argument("--overlap", type=int, default=80)
    args = parser.parse_args()

    input_path = Path(args.input)
    if not input_path.exists():
        raise FileNotFoundError(f"Article CSV not found: {input_path}")
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    df = pd.read_csv(input_path, dtype=str).fillna("")
    df["content"] = df["content"].map(clean_text)
    df["summary"] = df["content"].map(lambda value: value[:220])
    df = df[df["content"].str.len() > 0].drop_duplicates(subset=["source_url"])

    chunks = []
    for _, row in df.iterrows():
        article_chunks = chunk_text(row["content"], args.chunk_size, args.overlap)
        for index, chunk in enumerate(article_chunks):
            chunks.append(
                {
                    "chunk_id": f"{row['id']}_{index:04d}",
                    "article_id": row["id"],
                    "chunk_text": chunk,
                    "chunk_index": index,
                    "source_url": row["source_url"],
                    "title": row["title"],
                    "category": row.get("category", ""),
                }
            )

    article_path = output_dir / "agri_articles.csv"
    chunk_path = output_dir / "agri_article_chunks.csv"
    df.to_csv(article_path, index=False, encoding="utf-8-sig")
    pd.DataFrame(chunks).to_csv(chunk_path, index=False, encoding="utf-8-sig")

    print(f"Clean articles: {len(df)}")
    print(f"Chunks: {len(chunks)}")
    print(f"Article output: {article_path.resolve()}")
    print(f"Chunk output: {chunk_path.resolve()}")


if __name__ == "__main__":
    main()
