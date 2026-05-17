"""
Pipeline NLP pour l'extraction d'informations des CV.
Utilise SpaCy pour la reconnaissance d'entités et des regex pour l'expérience.
"""

import datetime
import re
import subprocess


class CVEntityExtractor:
    """Extracteur de compétences et d'expérience à partir du texte brut d'un CV."""

    SECTION_PATTERNS = {
        'experience': r'(?i)(expérience|experience|emploi|poste|travail|professionnel)',
        'formation': r'(?i)(formation|éducation|diplôme|université|école|études)',
        'competences': r'(?i)(compétence|skill|technologie|outil|maîtrise)',
        'langues': r'(?i)(langue|language|spoken)',
    }

    _nlp = None

    def __init__(self):
        import sys

        import spacy

        if CVEntityExtractor._nlp is None:
            try:
                CVEntityExtractor._nlp = spacy.load('fr_core_news_lg')
            except OSError:
                # Fallback only if not pre-installed
                try:
                    subprocess.run(
                        [sys.executable, '-m', 'spacy', 'download', 'fr_core_news_lg'],
                        check=True,
                        capture_output=True,
                    )
                    CVEntityExtractor._nlp = spacy.load('fr_core_news_lg')
                except Exception:
                    # Final fallback to a smaller model if large one fails
                    CVEntityExtractor._nlp = None

        self.nlp = CVEntityExtractor._nlp

    def extract_competences(self, text: str, offre_skills: list = None) -> list:
        """Cherche les compétences connues dans le texte du CV."""
        from apps.offres.models import Competence

        # Récupérer les compétences globales + celles de l'offre
        all_competences = set(Competence.objects.values_list('nom', flat=True))
        if offre_skills:
            all_competences.update(offre_skills)

        text_lower = text.lower()
        extracted = []

        # Matching direct (insensible à la casse)
        for comp in all_competences:
            # On cherche le mot exact avec des frontières de mot (\b) pour éviter les faux positifs (ex: "Go" dans "Google")
            pattern = r'\b' + re.escape(comp.lower()) + r'\b'
            if re.search(pattern, text_lower):
                extracted.append(comp)

        return extracted

    def extract_experience_years(self, text: str) -> int:
        """Extrait le nombre d'années d'expérience à partir de patterns texte."""
        patterns = [
            r'(\d+)\s+ans?\s+d[\'e]expérience',
            r'(\d+)\s+years?\s+of\s+experience',
            r'depuis\s+(\d{4})',
        ]
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                val = int(match.group(1))
                if val > 1900:
                    return datetime.date.today().year - val
                return val
        return 0

    def extract_sections(self, text: str) -> dict:
        """Détecte les sections présentes dans le CV."""
        return {
            section: bool(re.search(pattern, text))
            for section, pattern in self.SECTION_PATTERNS.items()
        }
