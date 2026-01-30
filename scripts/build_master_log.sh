#!/bin/bash
# Build Master Log PDF
# Atlas Universalis Documentation Build Script (Linux/Mac)
#
# Prerequisites:
#   sudo apt install pandoc wkhtmltopdf
#   OR
#   npm install -g markdown-pdf
#
# Usage: ./scripts/build_master_log.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCS_DIR="$SCRIPT_DIR/../docs/master_log"
MASTER_LOG_MD="$DOCS_DIR/Master_Log.md"
PROJECT_OVERVIEW_MD="$DOCS_DIR/PROJECT_OVERVIEW.md"
CSS_FILE="$DOCS_DIR/pdf.css"

echo -e "\033[36mBuilding Master Log PDFs...\033[0m"

# Check for available tools
if command -v pandoc &> /dev/null; then
    echo -e "\033[32mUsing Pandoc...\033[0m"
    
    # Build Master_Log.pdf
    pandoc "$MASTER_LOG_MD" -o "$DOCS_DIR/Master_Log.pdf" \
        --pdf-engine=wkhtmltopdf \
        --css="$CSS_FILE" \
        --metadata title="Atlas Universalis Master Log"
    
    # Build PROJECT_OVERVIEW.pdf
    pandoc "$PROJECT_OVERVIEW_MD" -o "$DOCS_DIR/PROJECT_OVERVIEW.pdf" \
        --pdf-engine=wkhtmltopdf \
        --css="$CSS_FILE" \
        --metadata title="Atlas Universalis Project Overview"
    
    echo -e "\033[32mPDFs generated successfully!\033[0m"

elif command -v markdown-pdf &> /dev/null; then
    echo -e "\033[32mUsing markdown-pdf...\033[0m"
    
    markdown-pdf "$MASTER_LOG_MD" --css-path "$CSS_FILE"
    markdown-pdf "$PROJECT_OVERVIEW_MD" --css-path "$CSS_FILE"
    
    echo -e "\033[32mPDFs generated successfully!\033[0m"

else
    echo -e "\033[33mNo PDF generator found. Please install one of:\033[0m"
    echo -e "\033[33m  - Pandoc: sudo apt install pandoc wkhtmltopdf\033[0m"
    echo -e "\033[33m  - markdown-pdf: npm install -g markdown-pdf\033[0m"
    echo ""
    echo -e "\033[36mMarkdown files are ready at:\033[0m"
    echo "  $MASTER_LOG_MD"
    echo "  $PROJECT_OVERVIEW_MD"
    exit 1
fi
