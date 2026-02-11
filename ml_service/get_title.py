from pypdf import PdfReader

try:
    reader = PdfReader("/home/adithya/agroaware/IEEE PAPER (1).pdf")
    # Just print the first page to get the title
    print(reader.pages[0].extract_text())
except Exception as e:
    print(f"Error reading PDF: {e}")
