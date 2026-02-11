from pypdf import PdfReader

try:
    reader = PdfReader("/home/adithya/agroaware/IEEE PAPER (1).pdf")
    # Get first page text and split lines
    text = reader.pages[0].extract_text().split('\n')
    # Print first 5 non-empty lines
    for line in text[:10]:
        if line.strip():
            print(line)
except Exception as e:
    print(f"Error reading PDF: {e}")
