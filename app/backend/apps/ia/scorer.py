"""
Calculateur de score de compatibilité entre un CV et une offre d'emploi.
Utilise des techniques de vectorisation et de similarité sémantique.
"""

import spacy
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class CompatibilityScorer:
    """Calcule un score sur 100 basé sur les compétences et l'expérience."""

    WEIGHT_COMPETENCES = 0.7
    WEIGHT_EXPERIENCE = 0.3
    EXPERIENCE_BONUS_PER_YEAR = 5

    _nlp = None

    def __init__(self):
        if CompatibilityScorer._nlp is None:
            try:
                CompatibilityScorer._nlp = spacy.load('fr_core_news_lg')
            except Exception:
                CompatibilityScorer._nlp = None

    def calculate_score(self, cv_data, offre) -> dict:
        """Calcule le score global et détaillé pour un candidat."""
        cv_competences = cv_data.competences_extraites or []
        offre_competences = offre.competences or []
        experience_requise = getattr(offre, 'experience_requise', 0) or 0
        experience_candidat = cv_data.experience_annees or 0

        # Si le CV est vide
        if not cv_competences and not (experience_candidat or 0):
            return {
                'score_global': 0.0,
                'score_competences': 0.0,
                'score_experience': 0.0,
                'matching_competences': [],
                'missing_competences': offre_competences,
                'status': 'Incomplet',
            }

        # Protection contre les contenus trop longs
        word_count = len(getattr(cv_data, 'texte_brut', '').split())
        if word_count > 2500:
            return {
                'score_global': 0.0,
                'score_competences': 0.0,
                'score_experience': 0.0,
                'matching_competences': [],
                'missing_competences': offre_competences,
                'status': 'Erreur (Contenu trop long)',
            }

        # Calcul du score des compétences
        if not offre_competences:
            score_competences = 100.0
            matching_competences = []
            missing_competences = []
        elif not cv_competences:
            score_competences = 0.0
            matching_competences = []
            missing_competences = offre_competences
        else:
            cv_set = {c.lower() for c in cv_competences}
            matching_competences = []
            for c in offre_competences:
                if c.lower() in cv_set:
                    matching_competences.append(c)
            
            remaining_offre = []
            for c in offre_competences:
                if c.lower() not in cv_set:
                    remaining_offre.append(c)
            
            semantic_matches = []
            if self._nlp and remaining_offre:
                cv_docs = []
                for c in cv_competences:
                    if len(c) > 2:
                        cv_docs.append(self._nlp(c))
                for req in remaining_offre:
                    req_doc = self._nlp(req)
                    if not getattr(req_doc, 'has_vector', False):
                        continue

                    best_sim = 0
                    for cv_doc in cv_docs:
                        if getattr(cv_doc, 'has_vector', False):
                            try:
                                sim = req_doc.similarity(cv_doc)
                            except Exception:
                                sim = 0
                            if sim > best_sim:
                                best_sim = sim

                    if best_sim > 0.85:
                        semantic_matches.append(req)

            total_matches = len(matching_competences) + len(semantic_matches)
            score_competences = (total_matches / len(offre_competences)) * 100
            
            for c in semantic_matches:
                matching_competences.append(c)
            missing_competences = []
            for c in offre_competences:
                if c not in matching_competences:
                    missing_competences.append(c)

        # Calcul du score d'expérience
        if experience_requise == 0:
            score_experience = 100.0
        elif experience_candidat >= experience_requise:
            bonus = (experience_candidat - experience_requise) * self.EXPERIENCE_BONUS_PER_YEAR
            score_experience = float(min(100.0 + bonus, 100.0))
        else:
            ratio = experience_candidat / experience_requise
            score_experience = float(ratio * 100)

        # Score final pondéré
        score_global = round(
            self.WEIGHT_COMPETENCES * score_competences + self.WEIGHT_EXPERIENCE * score_experience,
            1,
        )
        score_global = max(0.0, min(100.0, score_global))

        return {
            'score_global': score_global,
            'score_competences': round(score_competences, 1),
            'score_experience': round(score_experience, 1),
            'matching_competences': matching_competences,
            'missing_competences': missing_competences,
            'status': 'Conforme',
        }
