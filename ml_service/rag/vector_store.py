import numpy as np

class VectorStore:
    def __init__(self):
        self.embeddings = None
        self.text_chunks = []

    def add(self, embeddings, chunks):
        self.embeddings = embeddings
        self.text_chunks = chunks

    def search(self, query_embedding, top_k=3):
        # cosine similarity
        scores = np.dot(self.embeddings, query_embedding) / (
            np.linalg.norm(self.embeddings, axis=1) * np.linalg.norm(query_embedding)
        )
        top_indices = scores.argsort()[-top_k:][::-1]
        return [self.text_chunks[i] for i in top_indices]
    
# Global in-memory store (demo purpose)
vector_store = VectorStore()