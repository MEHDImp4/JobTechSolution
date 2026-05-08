# Taches Celery simplifiees
from celery import shared_task


@shared_task(bind=True, max_retries=3, queue='ia_queue')
def analyze_cv(self, candidature_id):
    from apps.candidatures.models import Candidature
    from apps.ia.service import extract_cv_text, extract_competences, normalize_competences
    from apps.ia.models import CVData

    try:
        candidature = Candidature.objects.get(pk=candidature_id)
        candidature.ia_status = 'processing'
        candidature.save(update_fields=['ia_status'])

        texte = extract_cv_text(candidature.cv_file.path)
        competences = extract_competences(
            texte,
            list(candidature.offre.competences.values_list('nom', flat=True)))
        competences = normalize_competences(competences)

        CVData.objects.update_or_create(
            candidature=candidature,
            defaults={
                'texte_brut': texte,
                'competences_extraites': competences,
                'extraction_error': '',
            },
        )

        calculate_score.delay(candidature_id)

    except Candidature.DoesNotExist:
        pass
    except Exception as exc:
        try:
            candidature.ia_status = 'error'
            candidature.save(update_fields=['ia_status'])
        except:
            pass
        raise self.retry(exc=exc, countdown=60 * (2**self.request.retries))


@shared_task(bind=True, max_retries=3, queue='ia_queue')
def calculate_score(self, candidature_id):
    from apps.candidatures.models import Candidature
    from apps.ia.service import compute_score
    from apps.ia.models import ScoreDetail

    try:
        candidature = Candidature.objects.select_related('offre', 'cv_data').get(pk=candidature_id)
        result = compute_score(candidature.cv_data, candidature.offre)

        ScoreDetail.objects.update_or_create(
            candidature=candidature,
            defaults={
                'score_competences': result['score_competences'],
                'score_experience': result['score_experience'],
                'score_global': result['score_global'],
                'matching_competences': result['matching_competences'],
                'missing_competences': result['missing_competences'],
            },
        )

        candidature.score_ia = result['score_global']
        candidature.ia_status = 'done'
        candidature.statut = 'refuse' if result['score_global'] < 20 else 'examen_rh'
        candidature.save(update_fields=['score_ia', 'ia_status', 'statut'])

    except Exception as exc:
        raise self.retry(exc=exc, countdown=60 * (2**self.request.retries))


@shared_task(bind=True, max_retries=3, queue='ia_queue')
def generate_cv_summary(self, candidature_id):
    from apps.ia.service import generate_summary
    from apps.ia.models import CVData

    try:
        cv_data = CVData.objects.get(candidature_id=candidature_id)
        if cv_data.texte_brut:
            cv_data.resume_ia = generate_summary(cv_data.texte_brut)
            cv_data.save(update_fields=['resume_ia'])
    except CVData.DoesNotExist:
        pass
    except Exception:
        pass