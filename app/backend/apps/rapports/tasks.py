# Tache pour generer le PDF d'une evaluation
from datetime import date

from celery import shared_task
from django.core.files.base import ContentFile


@shared_task(bind=True, max_retries=3, queue='pdf_queue')
def generate_evaluation_pdf(self, evaluation_id):
    from apps.evaluations.models import Evaluation

    from .pdf_generator import EvaluationPDFGenerator

    try:
        eval_obj = Evaluation.objects.select_related(
            'entretien__candidat',
            'entretien__candidature__offre',
        ).get(pk=evaluation_id)
    except Evaluation.DoesNotExist:
        return

    try:
        generator = EvaluationPDFGenerator()
        pdf_buffer = generator.generate(eval_obj)
        filename = f'evaluation_{evaluation_id}_{date.today().strftime("%Y%m%d")}.pdf'
        eval_obj.pdf_file.save(filename, ContentFile(pdf_buffer.read()), save=True)
    except Exception as exc:
        raise self.retry(exc=exc, countdown=60 * (2**self.request.retries))
