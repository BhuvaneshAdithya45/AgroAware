from pypdf import PdfReader

try:
    reader = PdfReader("/home/adithya/agroaware/IEEE PAPER (1).pdf")
    # Get first page text and split lines
    text = reader.pages[0].extract_text().split('\n')
    # Print first 30 lines to catch all authors
    print("--- CONTENT START ---")
    for i, line in enumerate(text[:40]):
        if line.strip():
            print(f"{i}: {line.strip()}")
    print("--- CONTENT END ---")
except Exception as e:
    print(f"Error reading PDF: {e}")
