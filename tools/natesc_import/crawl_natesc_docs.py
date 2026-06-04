import argparse
import hashlib
import re
import time
from datetime import datetime
from pathlib import Path
from urllib.parse import urljoin, urlparse

import pandas as pd
import requests
from bs4 import BeautifulSoup
from tqdm import tqdm


COLUMNS = [
    "id",
    "title",
    "source_url",
    "publish_date",
    "doc_type",
    "crop",
    "region",
    "content",
    "summary",
    "risk_level",
    "forecast_area",
    "control_measures",
    "created_at",
]

CROPS = ["水稻", "小麦", "玉米", "大豆", "马铃薯", "油菜", "棉花", "蔬菜", "果树", "茶树"]
REGIONS = ["全国", "华北", "东北", "华东", "华中", "华南", "西南", "西北", "长江中下游", "黄淮海"]
MEASURE_WORDS = ["防治", "绿色防控", "统防统治", "喷施", "诱杀", "药剂防治", "农业防治", "物理防治", "生物防治"]


def make_id(url: str) -> str:
    return hashlib.md5(url.encode("utf-8")).hexdigest()[:16]


def read_seed_urls(args) -> list[str]:
    urls = []
    if args.seed_url:
        urls.extend(args.seed_url)
    if args.seed_file:
        seed_file = Path(args.seed_file)
        if not seed_file.exists():
            raise FileNotFoundError(f"Seed file not found: {seed_file}")
        urls.extend(
            line.strip()
            for line in seed_file.read_text(encoding="utf-8").splitlines()
            if line.strip() and not line.strip().startswith("#")
        )
    return list(dict.fromkeys(urls))


def normalize_text(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def detect_date(text: str) -> str:
    match = re.search(r"(20\d{2})[-年./](\d{1,2})[-月./](\d{1,2})", text)
    if match:
        y, m, d = match.groups()
        return f"{int(y):04d}-{int(m):02d}-{int(d):02d}"
    return ""


def classify_doc_type(text: str) -> str:
    if any(word in text for word in ["预报", "发生趋势", "病虫害发生"]):
        return "pest_forecast"
    if any(word in text for word in ["防控方案", "防治方案", "绿色防控"]):
        return "control_plan"
    if any(word in text for word in ["生产指导", "技术指导", "栽培技术"]):
        return "production_guide"
    if any(word in text for word in ["水肥", "施肥", "灌溉"]):
        return "water_fertilizer_plan"
    return "other"


def find_first(text: str, candidates: list[str]) -> str:
    values = [item for item in candidates if item in text]
    return "|".join(values[:5])


def detect_risk_level(text: str) -> str:
    if any(word in text for word in ["大发生", "重发生", "高风险", "偏重"]):
        return "high"
    if any(word in text for word in ["中等", "中等发生", "中风险"]):
        return "medium"
    if any(word in text for word in ["偏轻", "低风险", "轻发生"]):
        return "low"
    return ""


def extract_control_measures(text: str) -> str:
    sentences = re.split(r"[。！？\n]", text)
    matched = []
    for sentence in sentences:
        if any(word in sentence for word in MEASURE_WORDS) and len(sentence) <= 180:
            matched.append(sentence.strip())
    return "|".join(dict.fromkeys(matched[:8]))


def fetch(url: str) -> str:
    headers = {
        "User-Agent": "SmartFarmNatescImporter/1.0 (+local research; polite interval)",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    }
    response = requests.get(url, headers=headers, timeout=20)
    response.raise_for_status()
    response.encoding = response.apparent_encoding or response.encoding
    return response.text


def parse_doc(url: str, html: str) -> dict:
    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["script", "style", "noscript", "iframe"]):
        tag.decompose()

    title_tag = soup.find("h1") or soup.find("title")
    title = normalize_text(title_tag.get_text(" ", strip=True) if title_tag else "")
    root = (
        soup.find("div", class_=re.compile(r"(TRS_Editor|article|content|main|text)", re.I))
        or soup.find("article")
        or soup.find("main")
        or soup.body
    )
    paragraphs = []
    if root:
        for node in root.find_all(["p", "div"], recursive=True):
            text = normalize_text(node.get_text(" ", strip=True))
            if len(text) >= 20 and not any(skip in text for skip in ["版权所有", "ICP备案", "打印本页"]):
                paragraphs.append(text)
    content = "\n".join(dict.fromkeys(paragraphs))
    if not content and root:
        content = normalize_text(root.get_text(" ", strip=True))

    full_text = f"{title}\n{content}"
    return {
        "id": make_id(url),
        "title": title,
        "source_url": url,
        "publish_date": detect_date(soup.get_text(" ", strip=True)),
        "doc_type": classify_doc_type(full_text),
        "crop": find_first(full_text, CROPS),
        "region": find_first(full_text, REGIONS),
        "content": content,
        "summary": content[:240],
        "risk_level": detect_risk_level(full_text),
        "forecast_area": find_first(full_text, REGIONS),
        "control_measures": extract_control_measures(content),
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }


def discover_links(base_url: str, html: str, limit: int) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    domains = [urlparse(base_url).netloc, "natesc.org.cn", "agri.cn", "moa.gov.cn"]
    links = []
    for a in soup.find_all("a", href=True):
        href = urljoin(base_url, a["href"]).split("#")[0]
        if any(domain and domain in href for domain in domains) and re.search(r"\.(s?html?|jspx?)($|\?)", href):
            links.append(href)
        if len(links) >= limit:
            break
    return list(dict.fromkeys(links))


def main() -> None:
    parser = argparse.ArgumentParser(description="Crawl NATE SC / extension service documents.")
    parser.add_argument("--seed-url", action="append", help="Seed URL, can be repeated.")
    parser.add_argument("--seed-file", help="Text file with one URL per line.")
    parser.add_argument("--output", default="./output/natesc_documents.csv")
    parser.add_argument("--max-pages", type=int, default=10)
    parser.add_argument("--delay", type=float, default=2.0)
    parser.add_argument("--discover", action="store_true")
    args = parser.parse_args()

    seed_urls = read_seed_urls(args)
    if not seed_urls:
        raise SystemExit("No seed URLs. Use --seed-url or --seed-file.")

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    queue = list(seed_urls)
    seen = set()
    rows = []
    with tqdm(total=args.max_pages, desc="Fetching documents") as bar:
        while queue and len(rows) < args.max_pages:
            url = queue.pop(0)
            if url in seen:
                continue
            seen.add(url)
            try:
                html = fetch(url)
                if args.discover:
                    queue.extend(link for link in discover_links(url, html, args.max_pages * 2) if link not in seen)
                doc = parse_doc(url, html)
                if doc["title"] and doc["content"]:
                    rows.append(doc)
                    bar.update(1)
                else:
                    print(f"Skip page without document content: {url}")
            except Exception as exc:
                print(f"Failed to fetch {url}: {exc}")
            time.sleep(args.delay)

    df = pd.DataFrame(rows, columns=COLUMNS).drop_duplicates(subset=["source_url"])
    df.to_csv(output_path, index=False, encoding="utf-8-sig")
    print(f"Documents: {len(df)}")
    print(f"Output: {output_path.resolve()}")


if __name__ == "__main__":
    main()
