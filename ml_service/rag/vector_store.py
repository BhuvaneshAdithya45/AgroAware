import numpy as np
import pickle
from pathlib import Path

# Default persistence path (same directory as this file)
STORE_PATH = Path(__file__).resolve().parent.parent / "rag_store.pkl"


class VectorStore:
    def __init__(self, persist_path=None):
        self.embeddings = None
        self.text_chunks = []
        self.persist_path = Path(persist_path) if persist_path else STORE_PATH
        # Auto-load from disk if a saved store exists
        self._load_from_disk()

    def add(self, embeddings, chunks):
        """Add embeddings and chunks, then persist to disk."""
        self.embeddings = embeddings
        self.text_chunks = chunks
        self._save_to_disk()

    def search(self, query_embedding, top_k=3):
        """Cosine similarity search over stored embeddings."""
        scores = np.dot(self.embeddings, query_embedding) / (
            np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(query_embedding)
        )
        top_indices = scores.argsort()[-top_k:][::-1]
        return [self.text_chunks[i] for i in top_indices]

    def _save_to_disk(self):
        """Persist embeddings and chunks to a pickle file."""
        try:
            data = {
                "embeddings": self.embeddings,
                "text_chunks": self.text_chunks,
            }
            with open(self.persist_path, "wb") as f:
                pickle.dump(data, f)
            print(f"💾 RAG store saved to {self.persist_path}")
        except Exception as e:
            print(f"⚠️ Failed to save RAG store: {e}")

    def _load_from_disk(self):
        """Load embeddings and chunks from disk if available."""
        if self.persist_path.exists():
            try:
                with open(self.persist_path, "rb") as f:
                    data = pickle.load(f)
                self.embeddings = data.get("embeddings")
                self.text_chunks = data.get("text_chunks", [])
                if self.embeddings is not None:
                    print(f"✅ RAG store loaded from disk ({len(self.text_chunks)} chunks)")
                else:
                    print("📭 RAG store file found but empty")
            except Exception as e:
                print(f"⚠️ Failed to load RAG store from disk: {e}")
        else:
            print("📭 No saved RAG store found — starting fresh")


# Global store with auto-persistence
vector_store = VectorStore()