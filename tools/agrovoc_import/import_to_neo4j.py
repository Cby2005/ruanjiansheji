import argparse
import os
from pathlib import Path

os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")

import pandas as pd
from dotenv import load_dotenv
from neo4j import GraphDatabase
from tqdm import tqdm


VALID_RELATION_TYPES = {
    "BROADER_THAN",
    "NARROWER_THAN",
    "RELATED_TO",
    "EXACT_MATCH",
    "CLOSE_MATCH",
}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Import parsed AGROVOC Chinese terms into Neo4j.")
    parser.add_argument("--concepts", required=True, help="Path to output/agrovoc_concepts.csv.")
    parser.add_argument("--relations", required=True, help="Path to output/agrovoc_relations.csv.")
    parser.add_argument("--env", default=".env", help="Path to Neo4j .env config file.")
    parser.add_argument("--batch-size", type=int, default=1000, help="Rows per Neo4j transaction.")
    return parser.parse_args()


def require_file(path: Path) -> None:
    if not path.exists():
        raise FileNotFoundError(f"Required file not found: {path}")


def load_config(env_path: Path) -> dict[str, str]:
    load_dotenv(env_path)
    config = {
        "uri": os.getenv("NEO4J_URI", "bolt://localhost:7687"),
        "user": os.getenv("NEO4J_USER", "neo4j"),
        "password": os.getenv("NEO4J_PASSWORD"),
        "database": os.getenv("NEO4J_DATABASE", "neo4j"),
    }
    if not config["password"]:
        raise ValueError("NEO4J_PASSWORD is not configured. Copy config.example.env to .env and set the password.")
    return config


def clean(value) -> str:
    if pd.isna(value):
        return ""
    return str(value)


def batch_rows(rows: list[dict], batch_size: int):
    for index in range(0, len(rows), batch_size):
        yield rows[index:index + batch_size]


def merge_concepts(tx, rows: list[dict]) -> None:
    tx.run(
        """
        UNWIND $rows AS row
        MERGE (n:AgroConcept {uri: row.uri})
        SET n.code = row.code,
            n.zhPrefLabel = row.zhPrefLabel,
            n.enPrefLabel = row.enPrefLabel,
            n.zhAltLabels = row.zhAltLabels,
            n.enAltLabels = row.enAltLabels,
            n.allZhLabels = row.allZhLabels,
            n.allEnLabels = row.allEnLabels,
            n.source = 'AGROVOC'
        """,
        rows=rows,
    )


def merge_relations(tx, relation_type: str, rows: list[dict]) -> None:
    if relation_type not in VALID_RELATION_TYPES:
        raise ValueError(f"Unsupported relation type: {relation_type}")
    tx.run(
        f"""
        UNWIND $rows AS row
        MATCH (source:AgroConcept {{uri: row.source_uri}})
        MATCH (target:AgroConcept {{uri: row.target_uri}})
        MERGE (source)-[:{relation_type}]->(target)
        """,
        rows=rows,
    )


def main() -> None:
    args = parse_args()
    base_dir = Path(__file__).resolve().parent
    concepts_path = Path(args.concepts)
    relations_path = Path(args.relations)
    env_path = Path(args.env)
    if not env_path.is_absolute():
        env_path = base_dir / env_path

    require_file(concepts_path)
    require_file(relations_path)
    require_file(env_path)

    config = load_config(env_path)
    concepts = pd.read_csv(concepts_path, dtype=str).fillna("")
    relations = pd.read_csv(relations_path, dtype=str).fillna("")

    concept_rows = [
        {
            "uri": clean(row["uri"]),
            "code": clean(row["code"]),
            "zhPrefLabel": clean(row["zh_pref_label"]),
            "enPrefLabel": clean(row["en_pref_label"]),
            "zhAltLabels": clean(row["zh_alt_labels"]),
            "enAltLabels": clean(row["en_alt_labels"]),
            "allZhLabels": clean(row["all_zh_labels"]),
            "allEnLabels": clean(row["all_en_labels"]),
        }
        for _, row in concepts.iterrows()
    ]

    relation_rows = [
        {
            "source_uri": clean(row["source_uri"]),
            "target_uri": clean(row["target_uri"]),
            "relation_type": clean(row["relation_type"]),
        }
        for _, row in relations.iterrows()
        if clean(row["relation_type"]) in VALID_RELATION_TYPES
    ]

    driver = GraphDatabase.driver(config["uri"], auth=(config["user"], config["password"]))
    try:
        with driver.session(database=config["database"]) as session:
            for batch in tqdm(list(batch_rows(concept_rows, args.batch_size)), desc="Importing concepts"):
                session.execute_write(merge_concepts, batch)

            for relation_type in sorted(VALID_RELATION_TYPES):
                typed_rows = [row for row in relation_rows if row["relation_type"] == relation_type]
                for batch in tqdm(list(batch_rows(typed_rows, args.batch_size)), desc=f"Importing {relation_type}"):
                    session.execute_write(merge_relations, relation_type, batch)
    finally:
        driver.close()

    print(f"Successfully imported nodes: {len(concept_rows)}")
    print(f"Successfully imported relationships: {len(relation_rows)}")


if __name__ == "__main__":
    main()
