import argparse
import re
from pathlib import Path

import pandas as pd


DISEASE_WORDS = ["病", "疫", "腐", "枯", "斑", "霉", "锈病", "白粉病", "稻瘟病"]
PEST_WORDS = ["虫", "螟", "蛾", "蚜", "螨", "蝇", "蓟马", "飞虱", "棉铃虫"]
WEATHER_FACTORS = ["高温", "低温", "降雨", "连阴雨", "干旱", "高湿", "大风", "寒潮", "寡照", "积温"]
MEASURE_WORDS = ["绿色防控", "统防统治", "喷施", "诱杀", "药剂防治", "农业防治", "物理防治", "生物防治", "排水", "轮作"]


def split_values(value: str) -> list[str]:
    return [item.strip() for item in re.split(r"[|,，、;；\s]+", str(value or "")) if item.strip()]


def find_named_terms(text: str, suffix_words: list[str], limit: int = 12) -> list[str]:
    pattern = r"[\u4e00-\u9fa5]{1,10}(?:" + "|".join(map(re.escape, suffix_words)) + r")"
    return list(dict.fromkeys(re.findall(pattern, text)))[:limit]


def find_evidence(text: str, *terms: str) -> str:
    sentences = re.split(r"[。！？\n]", text)
    for sentence in sentences:
        if all(term and term in sentence for term in terms):
            return sentence.strip()[:220]
    for sentence in sentences:
        if any(term and term in sentence for term in terms):
            return sentence.strip()[:220]
    return text[:220]


def add_triple(rows: list[dict], source: str, relation: str, target: str, evidence: str, source_url: str) -> None:
    if source and target and source != target:
        rows.append(
            {
                "source": source,
                "relation": relation,
                "target": target,
                "evidence": evidence,
                "source_url": source_url,
            }
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="Extract KG triples from NATE SC documents.")
    parser.add_argument("--documents", default="./output/natesc_documents.csv")
    parser.add_argument("--output", default="./output/natesc_kg_triples.csv")
    args = parser.parse_args()

    doc_path = Path(args.documents)
    if not doc_path.exists():
        raise FileNotFoundError(f"Document CSV not found: {doc_path}")
    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    docs = pd.read_csv(doc_path, dtype=str).fillna("")
    triples = []
    for _, row in docs.iterrows():
        text = f"{row.get('title', '')}\n{row.get('content', '')}"
        source_url = row.get("source_url", "")
        crops = split_values(row.get("crop", ""))
        regions = split_values(row.get("region", "")) + split_values(row.get("forecast_area", ""))
        diseases = find_named_terms(text, DISEASE_WORDS)
        pests = find_named_terms(text, PEST_WORDS)
        weather_factors = [factor for factor in WEATHER_FACTORS if factor in text]
        measures = split_values(row.get("control_measures", "")) or [word for word in MEASURE_WORDS if word in text]

        for crop in crops:
            for disease in diseases:
                add_triple(triples, crop, "HAS_DISEASE", disease, find_evidence(text, crop, disease), source_url)
            for pest in pests:
                add_triple(triples, crop, "HAS_PEST", pest, find_evidence(text, crop, pest), source_url)

        for factor in weather_factors:
            for disease in diseases:
                add_triple(triples, factor, "INCREASES_RISK_OF", disease, find_evidence(text, factor, disease), source_url)
            for pest in pests:
                add_triple(triples, factor, "INCREASES_RISK_OF", pest, find_evidence(text, factor, pest), source_url)

        for measure in measures[:8]:
            for disease in diseases[:8]:
                add_triple(triples, disease, "CONTROLLED_BY", measure, find_evidence(text, disease, measure), source_url)
            for pest in pests[:8]:
                add_triple(triples, pest, "CONTROLLED_BY", measure, find_evidence(text, pest, measure), source_url)

        for region in dict.fromkeys(regions):
            for risk in diseases + pests:
                add_triple(triples, region, "HAS_RISK", risk, find_evidence(text, region, risk), source_url)

    df = pd.DataFrame(triples).drop_duplicates()
    df.to_csv(output_path, index=False, encoding="utf-8-sig")
    print(f"Documents: {len(docs)}")
    print(f"Triples: {len(df)}")
    print(f"Output: {output_path.resolve()}")


if __name__ == "__main__":
    main()
