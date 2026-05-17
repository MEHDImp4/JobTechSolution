# Service layer pour l'IA - cache la complexite
import logging

logger = logging.getLogger(__name__)


def extract_cv_text(file_path):
    from apps.ia.extractors import CVTextExtractor

    extractor = CVTextExtractor()
    return extractor.extract(file_path)


def extract_competences(texte, offre_skills):
    from apps.ia.nlp_pipeline import CVEntityExtractor

    extractor = CVEntityExtractor()
    return extractor.extract_competences(texte, offre_skills=offre_skills)


def extract_experience(texte):
    from apps.ia.nlp_pipeline import CVEntityExtractor

    extractor = CVEntityExtractor()
    return extractor.extract_experience_years(texte)


def normalize_competences(competences):
    from apps.ia.llm_client import LLMClient

    try:
        client = LLMClient()
        return client.normalize_competences(competences)
    except Exception:
        return competences


def compute_score(cv_data, offre):
    from apps.ia.scorer import CompatibilityScorer

    scorer = CompatibilityScorer()
    return scorer.calculate_score(cv_data, offre)


def generate_summary(texte):
    from apps.ia.llm_client import LLMClient

    try:
        client = LLMClient()
        return client.generate_cv_summary(texte)
    except Exception:
        return "Resume non disponible."
