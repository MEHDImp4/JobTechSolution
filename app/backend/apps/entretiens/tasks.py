# Tache pour generer le resume IA d'un entretien
from celery import shared_task
from django.apps import apps


@shared_task(name='summarize_entretien', bind=True, max_retries=3)
def summarize_entretien_task(self, entretien_id):
    Entretien = apps.get_model('entretiens', 'Entretien')

    try:
        entretien = Entretien.objects.get(pk=entretien_id)
        if not entretien.notes:
            return 'No notes'

        from apps.ia.llm_client import LLMClient
        client = LLMClient()
        summary = client.generate_meeting_summary(entretien.notes)

        entretien.resume_ia = summary
        entretien.statut = 'termine'
        entretien.save(update_fields=['resume_ia', 'statut'])
        return 'Success'

    except Entretien.DoesNotExist:
        return 'Not Found'
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60)