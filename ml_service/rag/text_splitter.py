def split_text(
    text: str,
    chunk_size: int = 500,
    overlap: int = 100
):
    """
    Splits text into overlapping chunks.
    """
    chunks = []
    start = 0
    length = len(text)

    while start < length:
        end = start + chunk_size
        chunk = text[start:end]
        chunks.append(chunk)
        start += chunk_size - overlap

    return chunks
