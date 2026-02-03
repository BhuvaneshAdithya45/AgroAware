from sentence_transformers import SentenceTransformer

# Load once (important for speed)
model = SentenceTransformer("all-MiniLM-L6-v2")


def embed_texts(texts: list[str]):
    """
    Converts list of text chunks into embeddings.
    """
    return model.encode(texts, convert_to_numpy=True)


def embed_query(query: str):
    """
    Converts a user query into an embedding.
    """
    return model.encode([query], convert_to_numpy=True)[0]
