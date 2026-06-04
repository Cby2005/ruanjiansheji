import argparse
from datetime import datetime
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from pymilvus import Collection, CollectionSchema, DataType, FieldSchema, connections, utility
from tqdm import tqdm

from embedding_provider import create_provider


REQUIRED_COLUMNS = {
    "chunk_id",
    "article_id",
    "title",
    "source_url",
    "category",
    "publish_date",
    "chunk_index",
    "chunk_text",
}


def parse_args():
    parser = argparse.ArgumentParser(description="Import RAG chunks into Milvus")
    parser.add_argument("--input", required=True, help="CSV path, e.g. ../agri_article_import/output/agri_article_chunks.csv")
    parser.add_argument("--source", required=True, help="source name, e.g. agri_cn or natesc")
    parser.add_argument("--collection", default="smart_farm_rag_chunks")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", default="19530")
    parser.add_argument("--recreate", action="store_true")
    parser.add_argument("--batch-size", type=int, default=64)
    return parser.parse_args()


def ensure_collection(name: str, dim: int, recreate: bool):
    if recreate and utility.has_collection(name):
        utility.drop_collection(name)
    if utility.has_collection(name):
        collection = Collection(name)
        collection.load()
        return collection

    fields = [
        FieldSchema(name="id", dtype=DataType.VARCHAR, is_primary=True, auto_id=False, max_length=128),
        FieldSchema(name="article_id", dtype=DataType.VARCHAR, max_length=128),
        FieldSchema(name="source", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),
        FieldSchema(name="source_url", dtype=DataType.VARCHAR, max_length=1024),
        FieldSchema(name="category", dtype=DataType.VARCHAR, max_length=128),
        FieldSchema(name="publish_date", dtype=DataType.VARCHAR, max_length=64),
        FieldSchema(name="chunk_index", dtype=DataType.INT64),
        FieldSchema(name="chunk_text", dtype=DataType.VARCHAR, max_length=8192),
        FieldSchema(name="entities", dtype=DataType.VARCHAR, max_length=1024),
        FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=dim),
        FieldSchema(name="created_at", dtype=DataType.VARCHAR, max_length=64),
    ]
    schema = CollectionSchema(fields=fields, description="Smart farm RAG chunks")
    collection = Collection(name, schema)
    collection.create_index("vector", {
        "index_type": "HNSW",
        "metric_type": "COSINE",
        "params": {"M": 16, "efConstruction": 200},
    })
    collection.load()
    return collection


def validate_df(df: pd.DataFrame):
    missing = REQUIRED_COLUMNS - set(df.columns)
    if missing:
        raise ValueError(f"Input CSV missing required columns: {sorted(missing)}")


def row_value(row, key, default=""):
    value = row.get(key, default)
    if pd.isna(value):
        return default
    return str(value)


def main():
    load_dotenv()
    args = parse_args()
    input_path = Path(args.input)
    if not input_path.exists():
        raise FileNotFoundError(f"Input CSV not found: {input_path}")

    df = pd.read_csv(input_path, encoding="utf-8-sig")
    validate_df(df)
    if "source" not in df.columns:
        df["source"] = args.source
    if "entities" not in df.columns:
        df["entities"] = ""

    provider = create_provider()
    connections.connect(alias="default", host=args.host, port=args.port)
    collection = ensure_collection(args.collection, provider.dimension, args.recreate)

    output_dir = Path("output")
    output_dir.mkdir(parents=True, exist_ok=True)
    failed_rows = []
    success_embedding = 0
    success_write = 0

    print(f"Input chunks: {len(df)}")
    for start in tqdm(range(0, len(df), args.batch_size), desc="Importing"):
        batch = df.iloc[start:start + args.batch_size]
        try:
            texts = [row_value(row, "chunk_text") for _, row in batch.iterrows()]
            vectors = provider.embed_batch(texts)
            success_embedding += len(vectors)
            ids = [row_value(row, "chunk_id") for _, row in batch.iterrows()]
            collection.delete(f'id in {ids!r}')
            entities = [
                ids,
                [row_value(row, "article_id") for _, row in batch.iterrows()],
                [row_value(row, "source", args.source) or args.source for _, row in batch.iterrows()],
                [row_value(row, "title")[:512] for _, row in batch.iterrows()],
                [row_value(row, "source_url")[:1024] for _, row in batch.iterrows()],
                [row_value(row, "category")[:128] for _, row in batch.iterrows()],
                [row_value(row, "publish_date")[:64] for _, row in batch.iterrows()],
                [int(float(row_value(row, "chunk_index", "0") or 0)) for _, row in batch.iterrows()],
                [row_value(row, "chunk_text")[:8192] for _, row in batch.iterrows()],
                [row_value(row, "entities")[:1024] for _, row in batch.iterrows()],
                vectors,
                [datetime.now().isoformat(timespec="seconds") for _ in range(len(batch))],
            ]
            collection.insert(entities)
            success_write += len(batch)
        except Exception as exc:
            for _, row in batch.iterrows():
                failed = row.to_dict()
                failed["error"] = str(exc)
                failed_rows.append(failed)

    collection.flush()
    failed_path = output_dir / "failed_chunks.csv"
    if failed_rows:
        pd.DataFrame(failed_rows).to_csv(failed_path, index=False, encoding="utf-8-sig")

    print(f"Successful embeddings: {success_embedding}")
    print(f"Successful writes: {success_write}")
    print(f"Failed chunks: {len(failed_rows)}")
    if failed_rows:
        print(f"Failed chunk file: {failed_path}")


if __name__ == "__main__":
    main()
