import argparse
import re
from pathlib import Path

import pandas as pd
from tqdm import tqdm


DEFAULT_CROPS = ["水稻", "小麦", "玉米", "大豆", "马铃薯", "棉花", "油菜", "番茄", "黄瓜", "苹果", "葡萄"]
DISEASE_WORDS = ["病", "疫", "腐", "枯", "斑", "霉", "锈病", "白粉病", "稻瘟病"]
PEST_WORDS = ["虫", "螟", "蛾", "蚜", "螨", "蝇", "蓟马", "飞虱", "棉铃虫"]
MEASURE_WORDS = ["防治", "喷施", "施肥", "灌溉", "排水", "轮作", "深翻", "诱杀", "统防统治", "绿色防控"]


def load_agrovoc_terms(path: Path, limit: int) -> list[str]:
    if not path.exists():
        print(f"AGROVOC CSV not found, using built-in crop keywords only: {path}")
        return []
    df = pd.read_csv(path, dtype=str).fillna("")
    terms = []
    for _, row in df.iterrows():
        labels = []
        labels.extend(str(row.get("all_zh_labels", "")).split("|"))
        labels.append(str(row.get("zh_pref_label", "")))
        for label in labels:
            label = label.strip()
            if 2 <= len(label) <= 12 and not re.search(r"[()（）]", label):
                terms.append(label)
        if len(terms) >= limit:
            break
    return list(dict.fromkeys(terms))


def find_terms(text: str, terms: list[str], max_count: int = 12) -> list[str]:
    found = [term for term in terms if term and term in text]
    return list(dict.fromkeys(found))[:max_count]


def find_by_suffix(text: str, suffix_words: list[str], max_count: int = 12) -> list[str]:
    pattern = r"[\u4e00-\u9fa5]{1,10}(?:" + "|".join(map(re.escape, suffix_words)) + r")"
    found = re.findall(pattern, text)
    return list(dict.fromkeys(found))[:max_count]


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract article entities and tags for KG/RAG preparation.")
    parser.add_argument("--articles", default="./output/agri_articles.csv")
    parser.add_argument("--agrovoc", default="../agrovoc_import/output/agrovoc_concepts.csv")
    parser.add_argument("--output", default="./output")
    parser.add_argument("--term-limit", type=int, default=8000)
    args = parser.parse_args()

    article_path = Path(args.articles)
    if not article_path.exists():
        raise FileNotFoundError(f"Article CSV not found: {article_path}")
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    crop_terms = DEFAULT_CROPS + load_agrovoc_terms(Path(args.agrovoc), args.term_limit)
    crop_terms = list(dict.fromkeys(crop_terms))

    df = pd.read_csv(article_path, dtype=str).fillna("")
    entity_rows = []
    for index, row in tqdm(df.iterrows(), total=len(df), desc="Extracting entities"):
        text = f"{row.get('title', '')}\n{row.get('content', '')}"
        crops = find_terms(text, crop_terms)
        diseases = find_by_suffix(text, DISEASE_WORDS)
        pests = find_by_suffix(text, PEST_WORDS)
        measures = find_terms(text, MEASURE_WORDS)

        df.at[index, "crop_tags"] = "|".join(crops)
        df.at[index, "disease_tags"] = "|".join(diseases)
        df.at[index, "pest_tags"] = "|".join(pests)
        df.at[index, "measure_tags"] = "|".join(measures)

        for entity_type, values in [
            ("Crop", crops),
            ("Disease", diseases),
            ("Pest", pests),
            ("Measure", measures),
        ]:
            for value in values:
                entity_rows.append(
                    {
                        "article_id": row["id"],
                        "title": row.get("title", ""),
                        "entity_type": entity_type,
                        "entity": value,
                        "evidence": row.get("summary", "")[:180],
                        "source_url": row.get("source_url", ""),
                    }
                )

    tagged_path = output_dir / "agri_articles.csv"
    entity_path = output_dir / "agri_article_entities.csv"
    df.to_csv(tagged_path, index=False, encoding="utf-8-sig")
    pd.DataFrame(entity_rows).drop_duplicates().to_csv(entity_path, index=False, encoding="utf-8-sig")
    print(f"Tagged articles: {len(df)}")
    print(f"Entities: {len(entity_rows)}")
    print(f"Entity output: {entity_path.resolve()}")


if __name__ == "__main__":
    main()
