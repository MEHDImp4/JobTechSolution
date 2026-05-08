"""
Client pour les appels aux modèles de langage (LLM).
Gère la génération de synthèses de CV, de questions d'entretien et l'analyse de sentiment.
"""

from __future__ import annotations

import logging
import re

from django.conf import settings

logger = logging.getLogger(__name__)

# Paramètres de base
_MAX_INPUT_TOKENS = 3_000
_CHARS_PER_TOKEN = 4
_MAX_INPUT_CHARS = _MAX_INPUT_TOKENS * _CHARS_PER_TOKEN
_MAX_RETRIES = 3
_RETRY_BASE_DELAY = 2

# Prompts système pour l'IA
_SYSTEM_PROMPT = (
    'Tu es un assistant RH expert. '
    "A partir du texte brut d'un CV, "
    'redige un paragraphe de synthese en francais (5 a 8 phrases) '
    'soulignant le profil du candidat, ses principales competences, '
    'son experience et sa valeur ajoutee pour un poste. '
    'Sois factuel, professionnel et concis. '
    'Ne repete pas les coordonnees personnelles.'
)

_QUESTIONS_SYSTEM_PROMPT = (
    'Tu es un recruteur expert. '
    "A partir du CV d'un candidat et de la description du poste, "
    "genere exactement 5 questions d'entretien pertinentes, personnalisees et techniques. "
    "Les questions doivent aider a evaluer l'adequation du candidat pour le poste. "
    'Reponds uniquement avec une liste a puces en francais, une question par ligne. '
    "Ne mets pas de texte d'introduction ou de conclusion."
)

_SENTIMENT_SYSTEM_PROMPT = (
    'Tu es un expert en analyse de sentiment RH. '
    "A partir des notes de l'entretien, determine le sentiment general du recruteur. "
    "Reponds uniquement par l'un des mots suivants en minuscules : 'positif', 'neutre', 'negatif'."
)

def _fallback_normalize(data):
    return data


def _fallback_questions(data):
    return '\n'.join([
        'Parlez-moi de votre expérience la plus pertinente pour ce poste.',
        "Qu'est-ce qui vous attire particulièrement dans notre entreprise ?",
        'Pouvez-vous me décrire un défi technique complexe que vous avez résolu ?',
        'Comment gérez-vous les priorités dans un environnement de travail dynamique ?',
        "Quelles sont vos attentes en termes de collaboration et d'esprit d'équipe ?",
    ])


def _fallback_sentiment(data):
    return 'neutre'


def _fallback_recommendation(data):
    return 'Erreur lors de la génération de la recommandation IA.'


def _fallback_summary(notes):
    return f'[Résumé local] {notes[:300]}...'


def _fallback_summary_local(data):
    if len(data) > 300:
        return f'[Résumé local] {data[:300]}...'
    return f'[Résumé local] {data}'

_RECOMMENDATION_SYSTEM_PROMPT = (
    'Tu es un expert RH de haut niveau. '
    "Analyse le CV du candidat, la description du poste et les notes d'entretien fournies. "
    "Genere une recommandation d'embauche structuree (3 paragraphes) : "
    '1. Adéquation technique et expérience. '
    "2. Soft skills et potentiel d'intégration. "
    '3. Verdict final (Favorable, Réservé, Défavorable) avec justification.'
)

_SUMMARY_SYSTEM_PROMPT = (
    'Tu es un assistant RH expert. '
    "A partir des notes prises durant un entretien d'embauche, "
    'redige un compte-rendu structure en francais. '
    'Le compte-rendu doit inclure : '
    "1. Un resume global de l'entretien. "
    '2. Les points forts identifies. '
    '3. Les points de vigilance ou questions en suspens. '
    "4. Une conclusion sur l'impression generale. "
    'Sois professionnel, objectif et concis.'
)


# Nettoyage des données personnelles
_PII_PATTERNS = [
    (re.compile(r'(?:\+?33|0)\s*[1-9](?:[\s.\-]?\d{2}){4}'), '[TELEPHONE]'),
    (re.compile(r'[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}'), '[EMAIL]'),
    (re.compile(r'\d{5}\s+[A-Z][a-zA-Z\s\-]+(?:\n|$)', re.MULTILINE), '[ADRESSE]'),
    (re.compile(r'[12]\s*\d{2}\s*\d{2}\s*\d{2}\s*\d{3}\s*\d{3}\s*(?:\d{2})?'), '[NIR]'),
    (re.compile(r'\b\d{2}[/\-.]\d{2}[/\-.]\d{4}\b'), '[DATE_NAISSANCE]'),
]


def _sanitize_pii(text: str) -> str:
    """Supprime les données sensibles du texte."""
    for pattern, replacement in _PII_PATTERNS:
        text = pattern.sub(replacement, text)
    return text


def _truncate_to_token_limit(text: str) -> str:
    """Tronque le texte pour ne pas dépasser la limite de l'IA."""
    if len(text) > _MAX_INPUT_CHARS:
        return text[:_MAX_INPUT_CHARS]
    return text


_NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'
_NVIDIA_DEFAULT_MODEL = 'meta/llama-3.3-70b-instruct'


class LLMClient:
    """Interface avec l'API NVIDIA NIM (compatible OpenAI)."""

    def __init__(
        self,
        api_key: str | None = None,
        model: str = _NVIDIA_DEFAULT_MODEL,
        base_url: str = _NVIDIA_BASE_URL,
    ):
        self.api_key = api_key or getattr(settings, 'NVIDIA_API_KEY', '')
        self.model = model
        self.base_url = base_url
        self._client = None

    def generate_cv_summary(self, texte_brut: str) -> str:
        """Génère une synthèse de CV en un paragraphe."""
        if not texte_brut or not texte_brut.strip():
            return 'Aucun texte de CV disponible pour la synthese.'

        clean_text = _sanitize_pii(texte_brut)
        clean_text = _truncate_to_token_limit(clean_text)

        if not self.api_key:
            return self._local_fallback_summary(texte_brut)

        return self._call_with_retry(clean_text, _SYSTEM_PROMPT, self._local_fallback_summary)

    def normalize_competences(self, competences: list[str]) -> list[str]:
        """Normalise une liste de compétences via l'IA."""
        if not competences:
            return []

        raw_list = ', '.join(competences)
        if not self.api_key:
            return list(set(competences))

        result = self._call_with_retry(raw_list, _NORMALIZE_SYSTEM_PROMPT, _fallback_normalize)
        normalized = []
        for c in result.split(','):
            if c.strip():
                normalized.append(c.strip())
        return list(set(normalized))

    def generate_interview_questions(self, texte_cv: str, description_job: str) -> list[str]:
        """Génère des questions d'entretien basées sur le CV et le poste."""
        if not texte_cv or not description_job:
            return self._local_fallback_questions()

        clean_cv = _sanitize_pii(texte_cv)
        clean_cv = _truncate_to_token_limit(clean_cv)
        clean_job = _sanitize_pii(description_job)
        clean_job = _truncate_to_token_limit(clean_job)

        user_content = f'CV DU CANDIDAT:\n{clean_cv}\n\nDESCRIPTION DU POSTE:\n{clean_job}'

        if not self.api_key:
            return self._local_fallback_questions()

        raw_result = self._call_with_retry(
            user_content,
            _QUESTIONS_SYSTEM_PROMPT,
            _fallback_questions,
        )

        questions = []
        for line in raw_result.split('\n'):
            line = line.strip()
            if not line:
                continue
            line = re.sub(r'^[\-\*\•\d\.\s]+', '', line).strip()
            if line:
                questions.append(line)

        return questions[:5] if questions else self._local_fallback_questions()

    def analyze_interview_sentiment(self, notes: str) -> str:
        """Analyse le sentiment général des notes d'entretien."""
        if not notes or len(notes.strip()) < 20:
            return 'neutre'

        clean_notes = _sanitize_pii(notes)
        clean_notes = _truncate_to_token_limit(clean_notes)

        if not self.api_key:
            return 'neutre'

        sentiment = self._call_with_retry(
            clean_notes, _SENTIMENT_SYSTEM_PROMPT, _fallback_sentiment
        ).lower()

        if 'positif' in sentiment:
            return 'positif'
        if 'negatif' in sentiment:
            return 'negatif'
        return 'neutre'

    def generate_hiring_recommendation(self, cv_text: str, job_desc: str, eval_data: dict) -> str:
        """Génère une recommandation d'embauche détaillée."""
        if not cv_text or not job_desc or not eval_data:
            return 'Données insuffisantes pour générer une recommandation IA.'

        clean_cv = _sanitize_pii(cv_text)
        clean_job = _sanitize_pii(job_desc)

        eval_summary = (
            f'Notes: {eval_data.get("notes", "N/A")}\n'
            f'Compétences: {eval_data.get("competences_rate", 0)}/5\n'
            f'Communication: {eval_data.get("communication_rate", 0)}/5\n'
            f'Motivation: {eval_data.get("motivation_rate", 0)}/5\n'
            f'Culture Fit: {eval_data.get("culture_fit_rate", 0)}/5\n'
            f'Points forts: {eval_data.get("points_forts", "")}\n'
            f"Points d'amélioration: {eval_data.get('points_amelioration', '')}"
        )

        user_content = (
            f'CV DU CANDIDAT:\n{clean_cv}\n\n'
            f'DESCRIPTION DU POSTE:\n{clean_job}\n\n'
            f"EVALUATION DE L'ENTRETIEN:\n{eval_summary}"
        )

        user_content = _truncate_to_token_limit(user_content)

        if not self.api_key:
            return 'Service LLM non configuré. Recommandation IA indisponible.'

        return self._call_with_retry(
            user_content,
            _RECOMMENDATION_SYSTEM_PROMPT,
            _fallback_recommendation,
        )

    def generate_meeting_summary(self, notes: str) -> str:
        """Génère un compte-rendu d'entretien structuré."""
        if not notes or len(notes.strip()) < 20:
            return "Notes d'entretien insuffisantes pour générer un résumé."

        clean_notes = _sanitize_pii(notes)
        clean_notes = _truncate_to_token_limit(clean_notes)

        if not self.api_key:
            return f'[Résumé local] Entretien réalisé. Notes : {clean_notes[:200]}...'

        return self._call_with_retry(
            clean_notes, _SUMMARY_SYSTEM_PROMPT, _fallback_summary_local
        )

    def test_connection(self) -> str:
        """Vérifie la connexion à l'API LLM."""
        if not self.api_key:
            return 'not_configured'
        try:
            client = self._get_client()
            _ = client.models.list()
            return 'ok'
        except Exception as exc:
            return f'error: {exc}'

    def _get_client(self):
        """Initialise le client OpenAI (lazy loading)."""
        if self._client is None:
            try:
                from openai import OpenAI
            except ImportError:
                raise ImportError("Veuillez installer le package 'openai'.")
            self._client = OpenAI(api_key=self.api_key, base_url=self.base_url)
        return self._client

    def _call_with_retry(
        self, user_content: str, system_prompt: str, fallback_func: callable
    ) -> str:
        """Exécute l'appel API avec gestion des erreurs et repli local."""
        try:
            return self._call_api(user_content, system_prompt)
        except Exception as exc:
            if 'RateLimitError' in type(exc).__name__ or 'quota' in str(exc).lower():
                return fallback_func(user_content)
            raise

    def _call_api(self, user_content: str, system_prompt: str) -> str:
        """Appel direct à l'API de chat."""
        client = self._get_client()
        response = client.chat.completions.create(
            model=self.model,
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_content},
            ],
            max_tokens=400,
            temperature=0.3,
        )
        return response.choices[0].message.content.strip()

    def _local_fallback_questions(self) -> list[str]:
        """Retourne des questions génériques si l'IA est indisponible."""
        return [
            'Parlez-moi de votre expérience la plus pertinente pour ce poste.',
            "Qu'est-ce qui vous attire particulièrement dans notre entreprise ?",
            'Pouvez-vous me décrire un défi technique complexe que vous avez résolu ?',
            'Comment gérez-vous les priorités dans un environnement de travail dynamique ?',
            "Quelles sont vos attentes en termes de collaboration et d'esprit d'équipe ?",
        ]

    def _local_fallback_summary(self, texte_brut: str) -> str:
        """Génère une synthèse basique par mots-clés (repli)."""
        try:
            from apps.ia.nlp_pipeline import CVEntityExtractor

            extractor = CVEntityExtractor()
            competences = extractor.extract_competences(texte_brut)
            experience = extractor.extract_experience_years(texte_brut)

            comp_str = ', '.join(competences[:8]) if competences else 'non specifiees'
            exp_str = f'{experience} an(s)' if experience else 'non specifie'

            return (
                f'[Synthese locale] Le candidat dispose d\'environ {exp_str} d\'experience. '
                f'Competences identifiees : {comp_str}.'
            )
        except Exception:
            words = texte_brut.split()[:80]
            excerpt = ' '.join(words)
            return f'[Synthese locale] Extrait du CV : {excerpt}...'
