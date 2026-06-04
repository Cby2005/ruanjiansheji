import argparse
import re
from pathlib import Path

import pandas as pd


STANDARD_COLUMNS = [
    "registration_no",
    "pesticide_name",
    "category",
    "formulation",
    "total_content",
    "toxicity",
    "active_ingredient",
    "crop_or_site",
    "control_target",
    "application_method",
    "holder",
    "valid_until",
    "source_url",
]

COLUMN_ALIASES = {
    "登记证号": "registration_no",
    "农药名称": "pesticide_name",
    "产品名称": "pesticide_name",
    "类别": "category",
    "农药类别": "category",
    "剂型": "formulation",
    "总有效成分含量": "total_content",
    "总含量": "total_content",
    "毒性": "toxicity",
    "有效成分": "active_ingredient",
    "有效成分及含量": "active_ingredient",
    "作物/场所": "crop_or_site",
    "作物": "crop_or_site",
    "防治对象": "control_target",
    "使用方法": "application_method",
    "施用方法": "application_method",
    "登记证持有人": "holder",
    "持有人": "holder",
    "有效期至": "valid_until",
    "有效期": "valid_until",
    "来源": "source_url",
    "链接": "source_url",
}

DISEASE_HINTS = ["病", "疫", "腐", "枯", "斑", "霉", "锈病", "白粉病", "稻瘟病"]
PEST_HINTS = ["虫", "螟", "蛾", "蚜", "螨", "蝇", "蓟马", "飞虱", "棉铃虫"]


def read_table(path: Path) -> pd.DataFrame:
    if not path.exists():
        raise FileNotFoundError(f"Input file not found: {path}")
    if path.suffix.lower() in [".xlsx", ".xls"]:
        return pd.read_excel(path, dtype=str)
    return pd.read_csv(path, dtype=str, encoding="utf-8-sig")


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    rename = {}
    for column in df.columns:
        key = str(column).strip()
        rename[column] = COLUMN_ALIASES.get(key, key)
    df = df.rename(columns=rename)
    for column in STANDARD_COLUMNS:
        if column not in df.columns:
            df[column] = ""
    return df[STANDARD_COLUMNS].fillna("").astype(str)


def split_values(value: str) -> list[str]:
    cleaned = re.sub(r"\s+", "", str(value or ""))
    parts = re.split(r"[|,，、;；/]+", cleaned)
    return [part for part in parts if part]


def target_label(target: str) -> str:
    if any(word in target for word in PEST_HINTS):
        return "Pest"
    if any(word in target for word in DISEASE_HINTS):
        return "Disease"
    return "Pest"


def add_triple(rows: list[dict], source: str, relation: str, target: str, target_type: str, evidence: str, source_url: str) -> None:
    if source and target:
        rows.append(
            {
                "source": source,
                "relation": relation,
                "target": target,
                "target_type": target_type,
                "evidence": evidence,
                "source_url": source_url,
            }
        )


def build_triples(df: pd.DataFrame) -> pd.DataFrame:
    rows = []
    for _, row in df.iterrows():
        pesticide = row["pesticide_name"] or row["registration_no"]
        evidence = f"{row['registration_no']} {row['pesticide_name']} {row['crop_or_site']} {row['control_target']}".strip()
        source_url = row["source_url"]

        for ingredient in split_values(row["active_ingredient"]):
            add_triple(rows, pesticide, "HAS_INGREDIENT", ingredient, "ActiveIngredient", evidence, source_url)
        if row["category"]:
            add_triple(rows, pesticide, "BELONGS_TO", row["category"], "PesticideCategory", evidence, source_url)
        for crop in split_values(row["crop_or_site"]):
            add_triple(rows, pesticide, "REGISTERED_FOR", crop, "Crop", evidence, source_url)
        for target in split_values(row["control_target"]):
            add_triple(rows, pesticide, "CONTROLS", target, target_label(target), evidence, source_url)
        for method in split_values(row["application_method"]):
            add_triple(rows, pesticide, "USES_METHOD", method, "ApplicationMethod", evidence, source_url)
    return pd.DataFrame(rows).drop_duplicates()


def main() -> None:
    parser = argparse.ArgumentParser(description="Normalize manual pesticide registration CSV/XLSX.")
    parser.add_argument("--input", required=True, help="Manual CSV/XLSX exported from pesticide information site.")
    parser.add_argument("--output", default="./output")
    args = parser.parse_args()

    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    raw_df = read_table(Path(args.input))
    df = normalize_columns(raw_df).drop_duplicates(subset=["registration_no", "pesticide_name", "crop_or_site", "control_target"])
    triples = build_triples(df)

    registration_path = output_dir / "pesticide_registration.csv"
    triple_path = output_dir / "pesticide_kg_triples.csv"
    df.to_csv(registration_path, index=False, encoding="utf-8-sig")
    triples.to_csv(triple_path, index=False, encoding="utf-8-sig")

    print(f"Registrations: {len(df)}")
    print(f"Triples: {len(triples)}")
    print(f"Registration output: {registration_path.resolve()}")
    print(f"Triple output: {triple_path.resolve()}")
    print("Safety reminder: 具体药剂、浓度、施用次数和安全间隔期应以农药标签、登记信息和当地农技部门指导为准。")


if __name__ == "__main__":
    main()
