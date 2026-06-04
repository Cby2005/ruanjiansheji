import argparse
import os
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from neo4j import GraphDatabase


RELATION_LABELS = {
    "HAS_INGREDIENT": "ActiveIngredient",
    "BELONGS_TO": "PesticideCategory",
    "REGISTERED_FOR": "Crop",
    "CONTROLS": None,
    "USES_METHOD": "ApplicationMethod",
}

ALLOWED_TARGET_LABELS = {
    "ActiveIngredient",
    "PesticideCategory",
    "Crop",
    "Disease",
    "Pest",
    "ApplicationMethod",
}


def split_values(value: str) -> list[str]:
    return [item.strip() for item in str(value or "").replace("，", "|").replace(",", "|").replace("、", "|").split("|") if item.strip()]


def create_constraints(session) -> None:
    constraints = [
        "CREATE CONSTRAINT pesticide_name_unique IF NOT EXISTS FOR (n:Pesticide) REQUIRE n.name IS UNIQUE",
        "CREATE CONSTRAINT active_ingredient_name_unique IF NOT EXISTS FOR (n:ActiveIngredient) REQUIRE n.name IS UNIQUE",
        "CREATE CONSTRAINT crop_name_unique IF NOT EXISTS FOR (n:Crop) REQUIRE n.name IS UNIQUE",
        "CREATE CONSTRAINT disease_name_unique IF NOT EXISTS FOR (n:Disease) REQUIRE n.name IS UNIQUE",
        "CREATE CONSTRAINT pest_name_unique IF NOT EXISTS FOR (n:Pest) REQUIRE n.name IS UNIQUE",
        "CREATE CONSTRAINT application_method_name_unique IF NOT EXISTS FOR (n:ApplicationMethod) REQUIRE n.name IS UNIQUE",
        "CREATE CONSTRAINT pesticide_category_name_unique IF NOT EXISTS FOR (n:PesticideCategory) REQUIRE n.name IS UNIQUE",
    ]
    for statement in constraints:
        session.run(statement)


def merge_pesticide(session, row: dict) -> None:
    session.run(
        """
        MERGE (p:Pesticide {name: $name})
        SET p.registrationNo = $registration_no,
            p.formulation = $formulation,
            p.totalContent = $total_content,
            p.toxicity = $toxicity,
            p.holder = $holder,
            p.validUntil = $valid_until,
            p.sourceUrl = $source_url,
            p.source = '中国农药信息网'
        """,
        name=row.get("pesticide_name") or row.get("registration_no"),
        registration_no=row.get("registration_no", ""),
        formulation=row.get("formulation", ""),
        total_content=row.get("total_content", ""),
        toxicity=row.get("toxicity", ""),
        holder=row.get("holder", ""),
        valid_until=row.get("valid_until", ""),
        source_url=row.get("source_url", ""),
    )


def merge_relation(session, source: str, relation: str, target: str, target_label: str, evidence: str, source_url: str) -> bool:
    if relation not in RELATION_LABELS:
        return False
    if relation != "CONTROLS":
        target_label = RELATION_LABELS[relation]
    if target_label not in ALLOWED_TARGET_LABELS:
        return False
    statement = f"""
    MERGE (p:Pesticide {{name: $source}})
    MERGE (t:{target_label} {{name: $target}})
    MERGE (p)-[r:{relation}]->(t)
    SET r.evidence = $evidence,
        r.sourceUrl = $source_url
    """
    session.run(statement, source=source, target=target, evidence=evidence, source_url=source_url)
    return True


def main() -> None:
    parser = argparse.ArgumentParser(description="Import pesticide registration CSV into Neo4j.")
    parser.add_argument("--registrations", default="./output/pesticide_registration.csv")
    parser.add_argument("--triples", default="./output/pesticide_kg_triples.csv")
    args = parser.parse_args()

    load_dotenv()
    uri = os.getenv("NEO4J_URI", "bolt://localhost:7687")
    user = os.getenv("NEO4J_USER", "neo4j")
    password = os.getenv("NEO4J_PASSWORD")
    database = os.getenv("NEO4J_DATABASE", "neo4j")
    if not password:
        raise SystemExit("NEO4J_PASSWORD is required. Set it in environment variables or .env.")

    registration_path = Path(args.registrations)
    triple_path = Path(args.triples)
    if not registration_path.exists():
        raise FileNotFoundError(f"Registration CSV not found: {registration_path}")
    if not triple_path.exists():
        raise FileNotFoundError(f"Triple CSV not found: {triple_path}")

    registrations = pd.read_csv(registration_path, dtype=str).fillna("")
    triples = pd.read_csv(triple_path, dtype=str).fillna("")

    driver = GraphDatabase.driver(uri, auth=(user, password))
    node_count = 0
    relation_count = 0
    with driver.session(database=database) as session:
        create_constraints(session)
        for _, row in registrations.iterrows():
            data = row.to_dict()
            merge_pesticide(session, data)
            node_count += 1
        for _, row in triples.iterrows():
            if merge_relation(
                session,
                row.get("source", ""),
                row.get("relation", ""),
                row.get("target", ""),
                row.get("target_type", ""),
                row.get("evidence", ""),
                row.get("source_url", ""),
            ):
                relation_count += 1
    driver.close()

    print(f"Imported pesticide nodes: {node_count}")
    print(f"Imported pesticide relations: {relation_count}")
    print("Safety reminder: 具体药剂、浓度、施用次数和安全间隔期应以农药标签、登记信息和当地农技部门指导为准。")


if __name__ == "__main__":
    main()
