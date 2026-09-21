#!/usr/bin/env python3
"""
Script untuk mengkonversi PROJECT_DOCUMENTATION.md ke PDF
Requires: markdown, pdfkit, wkhtmltopdf
"""

import markdown
import pdfkit
from pathlib import Path

def generate_pdf():
    """Generate PDF from Markdown documentation"""
    
    # Read markdown file
    md_path = Path("PROJECT_DOCUMENTATION.md")
    if not md_path.exists():
        print("Error: PROJECT_DOCUMENTATION.md not found!")
        return
    
    md_content = md_path.read_text(encoding='utf-8')
    
    # Convert markdown to HTML
    html_content = markdown.markdown(
        md_content,
        extensions=[
            'markdown.extensions.tables',
            'markdown.extensions.fenced_code',
            'markdown.extensions.codehilite',
            'markdown.extensions.toc',
            'markdown.extensions.nl2br'
        ]
    )
    
    # Add CSS styling
    html_with_style = f"""
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AksesPangan - Dokumentasi Teknis</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            body {{
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                line-height: 1.6;
                color: #1a1a1a;
                max-width: 1200px;
                margin: 0 auto;
                padding: 40px;
                background: #ffffff;
            }}
            
            h1 {{
                font-size: 2.5em;
                font-weight: 700;
                color: #143628;
                border-bottom: 4px solid #2D6A4F;
                padding-bottom: 10px;
                margin-top: 40px;
                margin-bottom: 20px;
            }}
            
            h2 {{
                font-size: 2em;
                font-weight: 600;
                color: #1C4736;
                border-bottom: 2px solid #A8C8B0;
                padding-bottom: 8px;
                margin-top: 30px;
                margin-bottom: 15px;
            }}
            
            h3 {{
                font-size: 1.5em;
                font-weight: 600;
                color: #2D6A4F;
                margin-top: 25px;
                margin-bottom: 12px;
            }}
            
            h4 {{
                font-size: 1.2em;
                font-weight: 600;
                color: #3D7A59;
                margin-top: 20px;
                margin-bottom: 10px;
            }}
            
            p {{
                margin-bottom: 12px;
                text-align: justify;
            }}
            
            a {{
                color: #2D6A4F;
                text-decoration: none;
                border-bottom: 1px solid #A8C8B0;
            }}
            
            a:hover {{
                color: #1C4736;
                border-bottom-color: #2D6A4F;
            }}
            
            code {{
                background-color: #F7F9F6;
                color: #A45E2A;
                padding: 2px 6px;
                border-radius: 4px;
                font-family: 'Monaco', 'Courier New', monospace;
                font-size: 0.9em;
            }}
            
            pre {{
                background-color: #0D1B2A;
                color: #E0E0E0;
                padding: 20px;
                border-radius: 8px;
                overflow-x: auto;
                margin: 20px 0;
                border-left: 4px solid #2D6A4F;
            }}
            
            pre code {{
                background-color: transparent;
                color: inherit;
                padding: 0;
            }}
            
            table {{
                width: 100%;
                border-collapse: collapse;
                margin: 20px 0;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }}
            
            table thead {{
                background-color: #143628;
                color: #F3F8F5;
            }}
            
            table th {{
                padding: 12px;
                text-align: left;
                font-weight: 600;
                border-bottom: 2px solid #2D6A4F;
            }}
            
            table td {{
                padding: 10px 12px;
                border-bottom: 1px solid #DCE5DB;
            }}
            
            table tbody tr:nth-child(even) {{
                background-color: #F7F9F6;
            }}
            
            table tbody tr:hover {{
                background-color: #EDF2EC;
            }}
            
            blockquote {{
                border-left: 4px solid #A45E2A;
                padding-left: 20px;
                margin: 20px 0;
                color: #597367;
                font-style: italic;
                background-color: #FBF0E6;
                padding: 15px 20px;
                border-radius: 4px;
            }}
            
            ul, ol {{
                margin: 15px 0;
                padding-left: 30px;
            }}
            
            li {{
                margin-bottom: 8px;
            }}
            
            hr {{
                border: none;
                border-top: 2px solid #DCE5DB;
                margin: 30px 0;
            }}
            
            .page-break {{
                page-break-after: always;
            }}
            
            .toc {{
                background-color: #F7F9F6;
                border: 1px solid #DCE5DB;
                border-radius: 8px;
                padding: 20px;
                margin: 30px 0;
            }}
            
            .toc h2 {{
                margin-top: 0;
                border-bottom: none;
            }}
            
            .badge {{
                display: inline-block;
                padding: 4px 10px;
                border-radius: 12px;
                font-size: 0.85em;
                font-weight: 600;
                margin: 0 4px;
            }}
            
            .badge-success {{
                background-color: #E8F4EE;
                color: #2D6A4F;
            }}
            
            .badge-warning {{
                background-color: #FBF0E6;
                color: #A45E2A;
            }}
            
            .badge-info {{
                background-color: #E8F1F8;
                color: #0D47A1;
            }}
            
            @media print {{
                body {{
                    padding: 20px;
                }}
                
                h1 {{
                    page-break-before: always;
                }}
                
                h1:first-of-type {{
                    page-break-before: avoid;
                }}
                
                pre, table {{
                    page-break-inside: avoid;
                }}
            }}
        </style>
    </head>
    <body>
        {html_content}
        
        <hr style="margin-top: 60px;">
        <footer style="text-align: center; color: #597367; font-size: 0.9em; padding: 20px 0;">
            <p><strong>AksesPangan - Platform Penyelamatan Surplus Pangan</strong></p>
            <p>Tim Bojongsantos Empire © 2024</p>
            <p>Dokumentasi dibuat dengan Kiro AI-Assisted Development</p>
            <p><a href="https://bojongsantos-empire.vercel.app">https://bojongsantos-empire.vercel.app</a></p>
        </footer>
    </body>
    </html>
    """
    
    # Save HTML temporarily
    html_path = Path("temp_documentation.html")
    html_path.write_text(html_with_style, encoding='utf-8')
    
    # PDF options
    options = {
        'page-size': 'A4',
        'margin-top': '20mm',
        'margin-right': '20mm',
        'margin-bottom': '20mm',
        'margin-left': '20mm',
        'encoding': "UTF-8",
        'enable-local-file-access': None,
        'footer-center': 'Halaman [page] dari [topage]',
        'footer-font-size': '9',
        'footer-spacing': '5',
        'no-outline': None
    }
    
    # Generate PDF
    try:
        pdfkit.from_file(
            str(html_path),
            'AksesPangan_Documentation.pdf',
            options=options
        )
        print("✅ PDF berhasil dibuat: AksesPangan_Documentation.pdf")
    except Exception as e:
        print(f"❌ Error saat membuat PDF: {e}")
        print("Pastikan wkhtmltopdf sudah terinstall:")
        print("  Windows: choco install wkhtmltopdf")
        print("  Linux: sudo apt-get install wkhtmltopdf")
        print("  macOS: brew install wkhtmltopdf")
    finally:
        # Clean up temporary HTML file
        if html_path.exists():
            html_path.unlink()

if __name__ == "__main__":
    generate_pdf()
