import hashlib
import os
from typing import List

import numpy as np
import requests


class EmbeddingProvider:
    def embed(self, text: str) -> List[float]:
        raise NotImplementedError

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        return [self.embed(text) for text in texts]


class MockEmbeddingProvider(EmbeddingProvider):
    def __init__(self, dimension: int = 768):
        self.dimension = dimension

    def embed(self, text: str) -> List[float]:
        text = text or ""
        seed = hashlib.sha256(text.encode("utf-8")).digest()
        values = []
        i = 0
        while len(values) < self.dimension:
            if i and i % len(seed) == 0:
                seed = hashlib.sha256(seed + text.encode("utf-8") + str(i).encode("utf-8")).digest()
            value = seed[i % len(seed)]
            values.append((value - 127.5) / 127.5)
            i += 1
        vector = np.array(values, dtype=np.float32)
        norm = np.linalg.norm(vector)
        if norm > 0:
            vector = vector / norm
        return vector.tolist()


class OpenAiCompatibleEmbeddingProvider(EmbeddingProvider):
    def __init__(self, base_url: str, api_key: str, model: str, dimension: int):
        if not base_url:
            raise ValueError("EMBEDDING_BASE_URL is required")
        if not api_key:
            raise ValueError("EMBEDDING_API_KEY is required")
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model = model
        self.dimension = dimension

    def embed(self, text: str) -> List[float]:
        response = requests.post(
            f"{self.base_url}/embeddings",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={"model": self.model, "input": text or ""},
            timeout=60,
        )
        response.raise_for_status()
        vector = response.json()["data"][0]["embedding"]
        if len(vector) != self.dimension:
            raise ValueError(f"Embedding dimension mismatch: expected {self.dimension}, got {len(vector)}")
        return [float(x) for x in vector]


def create_provider() -> EmbeddingProvider:
    provider = os.getenv("EMBEDDING_PROVIDER", "mock").lower()
    dimension = int(os.getenv("EMBEDDING_DIMENSION", "768"))
    if provider == "mock":
        return MockEmbeddingProvider(dimension)
    if provider == "openai_compatible":
        return OpenAiCompatibleEmbeddingProvider(
            os.getenv("EMBEDDING_BASE_URL", ""),
            os.getenv("EMBEDDING_API_KEY", ""),
            os.getenv("EMBEDDING_MODEL", "bge-base-zh-v1.5"),
            dimension,
        )
    raise ValueError(f"Unsupported EMBEDDING_PROVIDER: {provider}")
