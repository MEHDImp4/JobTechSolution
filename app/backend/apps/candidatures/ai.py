import re
import zipfile
from pathlib import Path

from pypdf import PdfReader


EMAIL_PATTERN = re.compile(r'[\w\.-]+@[\w\.-]+\.\w+')
PHONE_PATTERN = re.compile(r'(\+?\d[\d\s\-\.\(\)]{7,}\d)')


def _normalize_text(value):
    # Nettoie les espaces pour avoir un texte plus simple a analyser.
    return ' '.join(value.split())


def extract_text_from_cv(file_field):
    # Lit un CV PDF ou DOCX et renvoie son texte.
    if not file_field:
        return ''

    extension = Path(file_field.name).suffix.lower()

    try:
        if extension == '.pdf':
            with file_field.open('rb') as source:
                reader = PdfReader(source)
                text = '\n'.join(page.extract_text() or '' for page in reader.pages)
                return _normalize_text(text)

        if extension == '.docx':
            with file_field.open('rb') as source:
                with zipfile.ZipFile(source) as archive:
                    xml = archive.read('word/document.xml').decode('utf-8', errors='ignore')
                text = re.sub(r'<[^>]+>', ' ', xml)
                return _normalize_text(text)
    except Exception:
        return ''

    return ''


def build_simple_ai_result(offre, cv_text='', message=''):
    # Compare le texte du CV avec les competences demandees par l'offre.
    full_text = _normalize_text(f'{cv_text} {message}').lower()
    skills = offre.skill_list()
    detected_skills = [skill for skill in skills if skill in full_text]
    score = round(len(detected_skills) / len(skills) * 100) if skills else 0

    email_match = EMAIL_PATTERN.search(full_text)
    phone_match = PHONE_PATTERN.search(full_text)

    extracted_data = {
        'email': email_match.group(0) if email_match else '',
        'telephone': phone_match.group(0).strip() if phone_match else '',
        'competences_detectees': detected_skills,
        'total_competences_requises': len(skills),
    }

    summary = (
        f'{len(detected_skills)} competence(s) detectee(s) sur {len(skills)}'
        if skills
        else 'Aucune competence requise definie pour cette offre.'
    )

    return {
        'score': score,
        'summary': summary,
        'extracted_data': extracted_data,
    }
