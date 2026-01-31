"""Generate PDF documentation from Markdown files."""
import markdown
from weasyprint import HTML, CSS
from pathlib import Path

# Paths
REPO_ROOT = Path(__file__).parent.parent
DOCS_DIR = REPO_ROOT / "docs" / "master_log"
OUTPUT_DIR = REPO_ROOT / "internal"
CSS_FILE = DOCS_DIR / "pdf.css"

# Files to convert
FILES = [
    ("Master_Log.md", "Master_Log.pdf"),
    ("PROJECT_OVERVIEW.md", "PROJECT_OVERVIEW.pdf"),
]

# HTML template
HTML_TEMPLATE = """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{title}</title>
    <style>{css}</style>
</head>
<body>
{content}
</body>
</html>
"""

def convert_md_to_pdf(md_file: Path, pdf_file: Path, css: str):
    """Convert a Markdown file to PDF."""
    print(f"Converting {md_file.name} -> {pdf_file.name}")
    
    # Read and convert markdown
    md_content = md_file.read_text(encoding="utf-8")
    html_content = markdown.markdown(
        md_content,
        extensions=["tables", "fenced_code", "toc"]
    )
    
    # Build full HTML
    title = md_file.stem.replace("_", " ")
    full_html = HTML_TEMPLATE.format(
        title=title,
        css=css,
        content=html_content
    )
    
    # Generate PDF
    HTML(string=full_html).write_pdf(pdf_file)
    print(f"  -> {pdf_file}")

def main():
    # Ensure output dir exists
    OUTPUT_DIR.mkdir(exist_ok=True)
    
    # Read CSS
    css = CSS_FILE.read_text(encoding="utf-8") if CSS_FILE.exists() else ""
    
    # Convert each file
    for md_name, pdf_name in FILES:
        md_path = DOCS_DIR / md_name
        pdf_path = OUTPUT_DIR / pdf_name
        
        if md_path.exists():
            convert_md_to_pdf(md_path, pdf_path, css)
        else:
            print(f"Warning: {md_path} not found, skipping")
    
    print("\nDone! PDFs saved to:", OUTPUT_DIR)

if __name__ == "__main__":
    main()
