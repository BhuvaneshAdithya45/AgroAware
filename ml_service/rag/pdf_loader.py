from pypdf import PdfReader


def load_pdf_text(file_path: str) -> str:
    """
    Reads a PDF file and returns all extracted text as a single string.
    """
    reader = PdfReader(file_path)
    pages_text = []

    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        if text:
            pages_text.append(text)

    return "\n".join(pages_text)
