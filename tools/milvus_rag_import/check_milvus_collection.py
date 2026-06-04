import argparse

from pymilvus import Collection, connections, utility


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--collection", default="smart_farm_rag_chunks")
    parser.add_argument("--host", default="localhost")
    parser.add_argument("--port", default="19530")
    args = parser.parse_args()

    connections.connect(alias="default", host=args.host, port=args.port)
    if not utility.has_collection(args.collection):
        print(f"Collection does not exist: {args.collection}")
        return
    collection = Collection(args.collection)
    print(f"Collection: {args.collection}")
    print(f"Entities: {collection.num_entities}")
    for field in collection.schema.fields:
        print(f"- {field.name}: {field.dtype} {field.params}")


if __name__ == "__main__":
    main()
