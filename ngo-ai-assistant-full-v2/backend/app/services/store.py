import os, re
import chromadb
from chromadb.utils import embedding_functions

CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

embedding_fn = embedding_functions.OpenAIEmbeddingFunction(
    api_key=os.getenv("OPENAI_API_KEY"),
    model_name="text-embedding-3-small"
)

collection = chroma_client.get_or_create_collection(
    "ngo_docs", embedding_function=embedding_fn
)

def _chunk(text: str, chunk_size=800, overlap=100):
    text = re.sub(r"\s+", " ", text).strip()
    chunks = []
    i = 0
    while i < len(text):
        chunks.append(text[i:i+chunk_size])
        i += chunk_size - overlap
    return chunks

def add(text: str, source: str):
    parts = _chunk(text)
    ids = [f"id_{abs(hash(source + p)) % (10**12)}" for p in parts]
    metas = [{"source": source} for _ in parts]
    collection.add(documents=parts, ids=ids, metadatas=metas)

def search(query: str, k: int = 4):
    results = collection.query(query_texts=[query], n_results=k)
    docs = []
    if results and results.get("documents"):
        for doc, meta in zip(results["documents"][0], results["metadatas"][0]):
            docs.append({"text": doc, "source": meta.get("source", "unknown")})
    return docs
