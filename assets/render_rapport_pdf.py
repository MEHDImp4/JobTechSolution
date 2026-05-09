"""
Render a Markdown report to a polished PDF using Python-Markdown + Playwright.

Usage (PowerShell):
  python assets/render_rapport_pdf.py assets/rapport_jobtech.md assets/rapport_jobtech_complet.pdf
"""

from __future__ import annotations

import argparse
import pathlib
import tempfile

import markdown
from playwright.sync_api import sync_playwright


_CSS = r"""
@page {
  size: A4;
  margin: 18mm 16mm 20mm 16mm;
}

html, body {
  padding: 0;
  margin: 0;
}

body {
  font-family: "Segoe UI", Arial, sans-serif;
  font-size: 11.2pt;
  line-height: 1.45;
  color: #111;
}

.page {
  max-width: 180mm;
  margin: 0 auto;
}

h1, h2, h3, h4 {
  font-weight: 700;
  letter-spacing: -0.01em;
  line-height: 1.2;
  margin: 18px 0 10px;
}

h1 { font-size: 24pt; margin-top: 10px; }
h2 { font-size: 18pt; margin-top: 22px; }
h3 { font-size: 14pt; margin-top: 18px; }
h4 { font-size: 12pt; margin-top: 14px; }

p { margin: 0 0 10px; }

hr {
  border: none;
  border-top: 1px solid #e6e6e6;
  margin: 16px 0;
}

pre {
  background: #0b1220;
  color: #e7eefc;
  padding: 10px 12px;
  border-radius: 10px;
  overflow-x: auto;
  margin: 12px 0;
}

code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
  font-size: 10.2pt;
}

p code {
  background: #f1f3f7;
  color: #111;
  padding: 1px 6px;
  border-radius: 999px;
}

blockquote {
  margin: 12px 0;
  padding: 10px 14px;
  border-left: 4px solid #d1d9ff;
  background: #f6f8ff;
  border-radius: 8px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0 16px;
  font-size: 10.6pt;
}

th, td {
  border: 1px solid #e6e6e6;
  padding: 8px 9px;
  vertical-align: top;
}

th {
  background: #f7f7f7;
  font-weight: 700;
}

ul, ol {
  margin: 6px 0 12px 22px;
}

li { margin: 2px 0; }

/* Make the cover blocks look intentional */
pre code {
  white-space: pre-wrap;
}

/* Avoid ugly breaks in headings */
h1, h2, h3, h4 { break-after: avoid-page; }
pre, table, blockquote { break-inside: avoid; }
"""


def _build_html(markdown_text: str) -> str:
    md = markdown.Markdown(
        extensions=[
            "fenced_code",
            "tables",
            "sane_lists",
        ]
    )
    body_html = md.convert(markdown_text)
    return f"""<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>JobTech Solutions — Rapport</title>
    <style>{_CSS}</style>
  </head>
  <body>
    <div class="page">
      {body_html}
    </div>
  </body>
</html>
"""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("input_md", type=pathlib.Path)
    parser.add_argument("output_pdf", type=pathlib.Path)
    args = parser.parse_args()

    input_md: pathlib.Path = args.input_md
    output_pdf: pathlib.Path = args.output_pdf

    md_text = input_md.read_text(encoding="utf-8")
    html = _build_html(md_text)

    output_pdf.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory() as tmpdir:
        tmp_path = pathlib.Path(tmpdir)
        html_path = tmp_path / "report.html"
        html_path.write_text(html, encoding="utf-8")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(html_path.as_uri(), wait_until="networkidle")

            page.pdf(
                path=str(output_pdf),
                format="A4",
                print_background=True,
                display_header_footer=True,
                header_template="<div></div>",
                footer_template=(
                    '<div style="width:100%; font-size:9px; color:#666; padding:0 12mm;'
                    ' display:flex; justify-content:space-between;">'
                    '<span>JobTech Solutions — Cahier des charges technique</span>'
                    '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span>'
                    "</div>"
                ),
                margin={"top": "18mm", "bottom": "20mm", "left": "16mm", "right": "16mm"},
            )
            browser.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

