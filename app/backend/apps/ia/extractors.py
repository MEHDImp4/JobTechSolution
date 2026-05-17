"""
Outils d'extraction de texte pour les fichiers de CV (PDF, DOCX).
"""

import re
from pathlib import Path

from .exceptions import CVExtractionError, CVUnsupportedFormatError


class CVTextExtractor:
    """Extracteur de texte brut à partir de fichiers PDF ou DOCX."""

    SUPPORTED_EXTENSIONS = {'.pdf', '.docx', '.doc'}

    def extract(self, file_path: str) -> str:
        """Point d'entrée principal pour l'extraction."""
        path = Path(file_path)
        ext = path.suffix.lower()
        if ext == '.pdf':
            return self._extract_pdf(path)
        elif ext in ('.docx', '.doc'):
            return self._extract_docx(path)
        else:
            raise CVUnsupportedFormatError(f'Format {ext} non supporté')

    def _extract_pdf(self, path: Path) -> str:
        """Extraction de texte depuis un PDF."""
        import PyPDF2

        text_parts = []
        try:
            with open(path, 'rb') as f:
                reader = PyPDF2.PdfReader(f)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        text_parts.append(text)
        except (OSError, PyPDF2.errors.PdfReadError) as exc:
            raise CVExtractionError(f'Impossible de lire le PDF : {exc}') from exc

        result = '\n'.join(text_parts)
        if not result.strip():
            # Si l'extraction standard échoue, on tente l'OCR
            return self._extract_pdf_ocr(path)
        return self._clean_text(result)

    def _extract_pdf_ocr(self, path: Path) -> str:
        """Extraction via OCR pour les PDF scannés."""
        try:
            import pytesseract
            from pdf2image import convert_from_path
        except ImportError:
            raise CVExtractionError('PDF non lisible (scan?) et OCR non configuré.')

        try:
            images = convert_from_path(str(path))
            text_parts = []
            for image in images:
                text = pytesseract.image_to_string(image, lang='fra+eng')
                if text:
                    text_parts.append(text)

            result = '\n'.join(text_parts)
            if not result.strip():
                raise CVExtractionError("OCR n'a extrait aucun texte.")

            return self._clean_text(result)
        except Exception as exc:
            raise CVExtractionError(f"Échec de l'OCR : {exc}") from exc

    def _extract_docx(self, path: Path) -> str:
        """Extraction de texte depuis un fichier Word."""
        from docx import Document

        try:
            doc = Document(path)
        except Exception as exc:
            raise CVExtractionError(f'Impossible de lire le DOCX : {exc}') from exc

        parts = []
        for p in doc.paragraphs:
            if p.text.strip():
                parts.append(p.text)
        for table in doc.tables:
            for row in table.rows:
                for cell in row.cells:
                    if cell.text.strip():
                        parts.append(cell.text)

        result = '\n'.join(parts)
        if not result.strip():
            raise CVExtractionError('DOCX vide ou non lisible')
        return self._clean_text(result)

    def _clean_text(self, text: str) -> str:
        """Nettoyage basique du texte extrait (espaces et retours à la ligne)."""
        text = re.sub(r'\n{3,}', '\n\n', text)
        text = re.sub(r' {2,}', ' ', text)
        return text.strip()
