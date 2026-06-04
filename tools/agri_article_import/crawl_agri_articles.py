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


ARTICLE_COLUMNS = [
    "id",
    "title",
    "source_name",
    "source_url",
    "publish_date",
    "category",
    "content",
    "summary",
    "crop_tags",
    "disease_tags",
    "pest_tags",
    "measure_tags",
    "created_at",
]


def make_id(url: str) -> str:
    return hashlib.md5(url.encode("utf-8")).hexdigest()[:16]


def read_seed_urls(args) -> list[str]:
    urls: list[str] = []
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
    text = re.sub(r"\s+", " ", text or "")
    return text.strip()


def detect_date(text: str) -> str:
    patterns = [
        r"(20\d{2})[-年./](\d{1,2})[-月./](\d{1,2})",
        r"(20\d{2})\s*年\s*(\d{1,2})\s*月\s*(\d{1,2})\s*日",
    ]
    for pattern in patterns:
        match = re.search(pattern, text)
        if match:
            y, m, d = match.groups()
            return f"{int(y):04d}-{int(m):02d}-{int(d):02d}"
    return ""


def classify_category(text: str) -> str:
    checks = [
        ("病虫害", ["病虫", "虫害", "病害", "防控", "防治"]),
        ("农业气象", ["气象", "降雨", "高温", "低温", "干旱", "寒潮"]),
        ("农事指导", ["农事", "栽培", "田间管理", "施肥", "灌溉"]),
        ("生产指导", ["生产", "技术指导", "绿色高产", "稳产"]),
    ]
    for category, keywords in checks:
        if any(word in text for word in keywords):
            return category
    return "其他"


def extract_article(url: str, html: str) -> dict:
    soup = BeautifulSoup(html, "lxml")
    for tag in soup(["script", "style", "noscript", "iframe"]):
        tag.decompose()

    title_tag = soup.find("h1") or soup.find("title")
    title = normalize_text(title_tag.get_text(" ", strip=True) if title_tag else "")

    content_root = (
        soup.find("div", class_=re.compile(r"(TRS_Editor|article|content|main|text)", re.I))
        or soup.find("article")
        or soup.find("main")
        or soup.body
    )
    paragraphs = []
    if content_root:
        for node in content_root.find_all(["p", "div"], recursive=True):
            text = normalize_text(node.get_text(" ", strip=True))
            if len(text) >= 20 and not any(skip in text for skip in ["版权所有", "ICP备案", "分享到", "打印本页"]):
                paragraphs.append(text)
    content = "\n".join(dict.fromkeys(paragraphs))
    if not content and content_root:
        content = normalize_text(content_root.get_text(" ", strip=True))

    page_text = soup.get_text(" ", strip=True)
    publish_date = detect_date(page_text)
    category = classify_category(title + " " + content)
    summary = content[:220]
    host = urlparse(url).netloc

    return {
        "id": make_id(url),
        "title": title,
        "source_name": host or "agri.cn",
        "source_url": url,
        "publish_date": publish_date,
        "category": category,
        "content": content,
        "summary": summary,
        "crop_tags": "",
        "disease_tags": "",
        "pest_tags": "",
        "measure_tags": "",
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }


def discover_links(base_url: str, html: str, limit: int) -> list[str]:
    soup = BeautifulSoup(html, "lxml")
    links: list[str] = []
    for a in soup.find_all("a", href=True):
        href = urljoin(base_url, a["href"])
        if href.startswith("http") and any(domain in href for domain in ["agri.cn", "moa.gov.cn"]):
            if re.search(r"\.(s?html?|jspx?)($|\?)", href) or "/art/" in href:
                links.append(href.split("#")[0])
        if len(links) >= limit:
            break
    return list(dict.fromkeys(links))


def fetch(url: str, timeout: int = 20) -> str:
    headers = {
        "User-Agent": "SmartFarmKnowledgeImporter/1.0 (+local research; polite interval)",
        "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
    }
    response = requests.get(url, headers=headers, timeout=timeout)
    response.raise_for_status()
    response.encoding = response.apparent_encoding or response.encoding
    return response.text


def main() -> None:
    parser = argparse.ArgumentParser(description="Crawl agri.cn article pages into CSV.")
    parser.add_argument("--seed-url", action="append", help="Seed URL, can be repeated.")
    parser.add_argument("--seed-file", help="Text file with one URL per line.")
    parser.add_argument("--output", default="./output/agri_articles.csv")
    parser.add_argument("--max-pages", type=int, default=10)
    parser.add_argument("--delay", type=float, default=2.0)
    parser.add_argument("--discover", action="store_true", help="Discover article links from seed pages.")
    args = parser.parse_args()

    seed_urls = read_seed_urls(args)
    if not seed_urls:
        raise SystemExit("No seed URLs. Use --seed-url or --seed-file.")

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    queue = list(seed_urls)
    seen = set()
    rows = []

    with tqdm(total=args.max_pages, desc="Fetching articles") as bar:
        while queue and len(rows) < args.max_pages:
            url = queue.pop(0)
            if url in seen:
                continue
            seen.add(url)
            try:
                html = fetch(url)
                if args.discover:
                    queue.extend(link for link in discover_links(url, html, args.max_pages * 2) if link not in seen)
                article = extract_article(url, html)
                if article["title"] and article["content"]:
                    rows.append(article)
                    bar.update(1)
                else:
                    print(f"Skip page without article content: {url}")
            except Exception as exc:
                print(f"Failed to fetch {url}: {exc}")
            time.sleep(args.delay)

    df = pd.DataFrame(rows, columns=ARTICLE_COLUMNS).drop_duplicates(subset=["source_url"])
    df.to_csv(output_path, index=False, encoding="utf-8-sig")
    print(f"Articles: {len(df)}")
    print(f"Output: {output_path.resolve()}")


if __name__ == "__main__":
    main()
