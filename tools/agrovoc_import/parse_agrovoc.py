import argparse
import os
import shutil
import tempfile
import zipfile
from pathlib import Path
from typing import Iterable
from urllib.parse import urlparse
import xml.etree.ElementTree as ET

os.environ.setdefault("OPENBLAS_NUM_THREADS", "1")
os.environ.setdefault("OMP_NUM_THREADS", "1")
os.environ.setdefault("MKL_NUM_THREADS", "1")

import pandas as pd
from rdflib import Graph
from rdflib.namespace import SKOS
from tqdm import tqdm


FORMAT_BY_SUFFIX = {
    ".rdf": "xml",
    ".xml": "xml",
    ".nt": "nt",
    ".ttl": "turtle",
}

ZIP_PRIORITY = [".rdf", ".xml", ".nt", ".ttl"]

RELATION_MAP = {
    SKOS.broader: "BROADER_THAN",
    SKOS.narrower: "NARROWER_THAN",
    SKOS.related: "RELATED_TO",
    SKOS.exactMatch: "EXACT_MATCH",
    SKOS.closeMatch: "CLOSE_MATCH",
}

RDF_NS = "http://www.w3.org/1999/02/22-rdf-syntax-ns#"
SKOS_NS = "http://www.w3.org/2004/02/skos/core#"
SKOSXL_NS = "http://www.w3.org/2008/05/skos-xl#"
XML_NS = "http://www.w3.org/XML/1998/namespace"

RDF_ABOUT = f"{{{RDF_NS}}}about"
RDF_RESOURCE = f"{{{RDF_NS}}}resource"
XML_LANG = f"{{{XML_NS}}}lang"

XML_LABEL_TAGS = {
    f"{{{SKOS_NS}}}prefLabel": "pref",
    f"{{{SKOS_NS}}}altLabel": "alt",
}

XML_RELATION_TAGS = {
    f"{{{SKOS_NS}}}broader": "BROADER_THAN",
    f"{{{SKOS_NS}}}narrower": "NARROWER_THAN",
    f"{{{SKOS_NS}}}related": "RELATED_TO",
    f"{{{SKOS_NS}}}exactMatch": "EXACT_MATCH",
    f"{{{SKOS_NS}}}closeMatch": "CLOSE_MATCH",
}

XML_LABEL_REF_TAGS = {
    f"{{{SKOSXL_NS}}}prefLabel": "pref",
    f"{{{SKOSXL_NS}}}altLabel": "alt",
}

XML_LITERAL_FORM_TAG = f"{{{SKOSXL_NS}}}literalForm"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Parse Chinese AGROVOC terms from a local RDF/NT/TTL file or ZIP archive."
    )
    parser.add_argument("--input", required=True, help="Path to agrovoc_core.raf.zip or RDF/NT/TTL file.")
    parser.add_argument("--output", required=True, help="Output directory for CSV files.")
    parser.add_argument(
        "--format",
        choices=["xml", "nt", "turtle"],
        help="Manually specify RDF format. If omitted, format is inferred from file extension.",
    )
    return parser.parse_args()


def infer_format(path: Path, explicit_format: str | None = None) -> str:
    if explicit_format:
        return explicit_format
    rdf_format = FORMAT_BY_SUFFIX.get(path.suffix.lower())
    if not rdf_format:
        raise ValueError(
            f"Cannot infer RDF format from '{path.name}'. "
            "Use --format xml, --format nt, or --format turtle."
        )
    return rdf_format


def print_zip_contents(zip_path: Path, members: Iterable[zipfile.ZipInfo]) -> None:
    print(f"ZIP file: {zip_path}")
    print("Files in ZIP:")
    for member in members:
        if not member.is_dir():
            print(f"  - {member.filename} ({member.file_size} bytes)")


def choose_rdf_member(members: list[zipfile.ZipInfo]) -> zipfile.ZipInfo:
    files = [member for member in members if not member.is_dir()]
    for suffix in ZIP_PRIORITY:
        matches = [member for member in files if Path(member.filename).suffix.lower() == suffix]
        if matches:
            return sorted(matches, key=lambda item: item.filename)[0]
    supported = ", ".join(ZIP_PRIORITY)
    raise FileNotFoundError(
        f"No RDF/NT/TTL file found in ZIP. Expected one of: {supported}. "
        "Please check the archive contents."
    )


def materialize_input(input_path: Path, explicit_format: str | None) -> tuple[Path, str, tempfile.TemporaryDirectory | None]:
    if not input_path.exists():
        raise FileNotFoundError(f"Input file not found: {input_path}")

    if zipfile.is_zipfile(input_path):
        temp_dir = tempfile.TemporaryDirectory(prefix="agrovoc_")
        with zipfile.ZipFile(input_path) as archive:
            members = archive.infolist()
            print_zip_contents(input_path, members)
            selected = choose_rdf_member(members)
            selected_name = Path(selected.filename).name
            target_path = Path(temp_dir.name) / selected_name
            print(f"Selected RDF file: {selected.filename}")
            with archive.open(selected) as source, target_path.open("wb") as target:
                shutil.copyfileobj(source, target, length=16 * 1024 * 1024)
        rdf_format = infer_format(target_path, explicit_format)
        print(f"RDF format: {rdf_format}")
        return target_path, rdf_format, temp_dir

    rdf_format = infer_format(input_path, explicit_format)
    print(f"Input file: {input_path}")
    print(f"RDF format: {rdf_format}")
    return input_path, rdf_format, None


def parse_graph(rdf_path: Path, rdf_format: str) -> Graph:
    graph = Graph()
    try:
        graph.parse(str(rdf_path), format=rdf_format)
    except Exception as exc:
        raise RuntimeError(
            f"RDF parsing failed for '{rdf_path}' using format '{rdf_format}'. "
            "Please check the file format, or rerun with --format xml/nt/turtle."
        ) from exc
    print(f"RDF triples parsed: {len(graph)}")
    return graph


def parse_rdf_xml_stream(rdf_path: Path) -> tuple[pd.DataFrame, pd.DataFrame]:
    """Stream RDF/XML to avoid loading a 1GB+ AGROVOC graph into memory."""
    label_map: dict[str, dict[str, list[str]]] = {}
    label_refs: dict[str, dict[str, list[str]]] = {}
    literal_forms: dict[str, dict[str, list[str]]] = {}
    relation_rows = []
    root = None
    processed = 0

    context = ET.iterparse(rdf_path, events=("start", "end"))
    for event, element in tqdm(context, desc="Streaming RDF/XML"):
        if event == "start" and root is None:
            root = element
            continue
        if event != "end":
            continue

        subject_uri = element.attrib.get(RDF_ABOUT)
        if not subject_uri:
            continue

        for child in list(element):
            label_kind = XML_LABEL_TAGS.get(child.tag)
            if label_kind:
                lang = child.attrib.get(XML_LANG, "").lower()
                text = (child.text or "").strip()
                if text and lang in {"zh", "en"}:
                    entry = label_map.setdefault(subject_uri, {"zh_pref": [], "en_pref": [], "zh_alt": [], "en_alt": []})
                    entry[f"{lang}_{label_kind}"].append(text)
                continue

            label_ref_kind = XML_LABEL_REF_TAGS.get(child.tag)
            if label_ref_kind:
                label_uri = child.attrib.get(RDF_RESOURCE)
                if label_uri:
                    refs = label_refs.setdefault(subject_uri, {"pref": [], "alt": []})
                    refs[label_ref_kind].append(label_uri)
                continue

            if child.tag == XML_LITERAL_FORM_TAG:
                lang = child.attrib.get(XML_LANG, "").lower()
                text = (child.text or "").strip()
                if text and lang in {"zh", "en"}:
                    literal_forms.setdefault(subject_uri, {"zh": [], "en": []})[lang].append(text)
                continue

            relation_type = XML_RELATION_TAGS.get(child.tag)
            if relation_type:
                target_uri = child.attrib.get(RDF_RESOURCE)
                if target_uri:
                    relation_rows.append(
                        {
                            "source_uri": subject_uri,
                            "target_uri": target_uri,
                            "relation_type": relation_type,
                        }
                    )

        processed += 1
        element.clear()
        if root is not None:
            root.clear()

    for concept_uri, refs in label_refs.items():
        entry = label_map.setdefault(concept_uri, {"zh_pref": [], "en_pref": [], "zh_alt": [], "en_alt": []})
        for kind in ("pref", "alt"):
            for label_uri in refs[kind]:
                forms = literal_forms.get(label_uri, {})
                entry[f"zh_{kind}"].extend(forms.get("zh", []))
                entry[f"en_{kind}"].extend(forms.get("en", []))

    concepts, concept_uris = concepts_from_label_map(label_map)
    if relation_rows:
        relations = pd.DataFrame(relation_rows)
        relations = relations[
            relations["source_uri"].isin(concept_uris)
            & relations["target_uri"].isin(concept_uris)
        ].drop_duplicates().sort_values(["relation_type", "source_uri", "target_uri"])
    else:
        relations = pd.DataFrame(columns=["source_uri", "target_uri", "relation_type"])

    print(f"RDF/XML subjects processed: {processed}")
    return concepts, relations


def is_lang(literal, lang: str) -> bool:
    return getattr(literal, "language", None) and literal.language.lower() == lang


def code_from_uri(uri: str) -> str:
    parsed = urlparse(uri)
    tail = parsed.fragment or parsed.path.rstrip("/").split("/")[-1]
    return tail or uri.rsplit("/", 1)[-1]


def unique_join(values: Iterable[str]) -> str:
    seen = set()
    cleaned = []
    for value in values:
        text = str(value).strip()
        if text and text not in seen:
            cleaned.append(text)
            seen.add(text)
    return "|".join(cleaned)


def extract_labels(graph: Graph) -> tuple[pd.DataFrame, set[str]]:
    label_map: dict[str, dict[str, list[str]]] = {}

    for predicate, key in ((SKOS.prefLabel, "pref"), (SKOS.altLabel, "alt")):
        for subject, _, label in tqdm(graph.triples((None, predicate, None)), desc=f"Reading {key}Label"):
            if is_lang(label, "zh") or is_lang(label, "en"):
                uri = str(subject)
                entry = label_map.setdefault(uri, {"zh_pref": [], "en_pref": [], "zh_alt": [], "en_alt": []})
                if is_lang(label, "zh"):
                    entry[f"zh_{key}"].append(str(label))
                elif is_lang(label, "en"):
                    entry[f"en_{key}"].append(str(label))

    return concepts_from_label_map(label_map)


def concepts_from_label_map(label_map: dict[str, dict[str, list[str]]]) -> tuple[pd.DataFrame, set[str]]:
    rows = []
    for uri, labels in label_map.items():
        zh_pref = unique_join(labels["zh_pref"])
        zh_alt = unique_join(labels["zh_alt"])
        if not zh_pref and not zh_alt:
            continue

        en_pref = unique_join(labels["en_pref"])
        en_alt = unique_join(labels["en_alt"])
        all_zh = unique_join([*labels["zh_pref"], *labels["zh_alt"]])
        all_en = unique_join([*labels["en_pref"], *labels["en_alt"]])
        rows.append(
            {
                "uri": uri,
                "code": code_from_uri(uri),
                "zh_pref_label": zh_pref,
                "en_pref_label": en_pref,
                "zh_alt_labels": zh_alt,
                "en_alt_labels": en_alt,
                "all_zh_labels": all_zh,
                "all_en_labels": all_en,
            }
        )

    concepts = pd.DataFrame(rows).drop_duplicates(subset=["uri"]).sort_values(["zh_pref_label", "uri"])
    if concepts.empty:
        concepts = pd.DataFrame(
            columns=[
                "uri",
                "code",
                "zh_pref_label",
                "en_pref_label",
                "zh_alt_labels",
                "en_alt_labels",
                "all_zh_labels",
                "all_en_labels",
            ]
        )
    concept_uris = set(concepts["uri"].tolist())
    return concepts, concept_uris


def extract_relations(graph: Graph, concept_uris: set[str]) -> pd.DataFrame:
    rows = []
    for predicate, relation_type in RELATION_MAP.items():
        for source, _, target in tqdm(graph.triples((None, predicate, None)), desc=f"Reading {relation_type}"):
            source_uri = str(source)
            target_uri = str(target)
            if source_uri in concept_uris and target_uri in concept_uris:
                rows.append(
                    {
                        "source_uri": source_uri,
                        "target_uri": target_uri,
                        "relation_type": relation_type,
                    }
                )

    if not rows:
        return pd.DataFrame(columns=["source_uri", "target_uri", "relation_type"])
    return pd.DataFrame(rows).drop_duplicates().sort_values(["relation_type", "source_uri", "target_uri"])


def main() -> None:
    args = parse_args()
    input_path = Path(args.input)
    output_dir = Path(args.output)
    output_dir.mkdir(parents=True, exist_ok=True)

    temp_dir = None
    try:
        rdf_path, rdf_format, temp_dir = materialize_input(input_path, args.format)
        if rdf_format == "xml":
            concepts, relations = parse_rdf_xml_stream(rdf_path)
        else:
            graph = parse_graph(rdf_path, rdf_format)
            concepts, concept_uris = extract_labels(graph)
            relations = extract_relations(graph, concept_uris)

        concepts_path = output_dir / "agrovoc_concepts.csv"
        relations_path = output_dir / "agrovoc_relations.csv"

        concepts.to_csv(concepts_path, index=False, encoding="utf-8-sig")
        relations.to_csv(relations_path, index=False, encoding="utf-8-sig")

        print(f"Chinese concept count: {len(concepts)}")
        print(f"Relation count: {len(relations)}")
        print(f"Concept CSV: {concepts_path.resolve()}")
        print(f"Relation CSV: {relations_path.resolve()}")
    finally:
        if temp_dir is not None:
            temp_dir.cleanup()


if __name__ == "__main__":
    main()
