# Tache pour generer les statistiques mensuelles
from celery import shared_task
from datetime import date, timedelta
from django.utils import timezone
from apps.candidatures.models import Candidature
from apps.entretiens.models import Entretien
from .models import KPISnapshot


@shared_task(name='generate_monthly_snapshot')
def generate_monthly_snapshot():
    today = date.today()
    first_day = today.replace(day=1)
    last_day = first_day - timedelta(days=1)
    month = last_day.replace(day=1)

    start = timezone.make_aware(timezone.datetime.combine(month, timezone.datetime.min.time()))
    end = timezone.make_aware(timezone.datetime.combine(first_day, timezone.datetime.min.time()))

    try:
        total_interviews = Entretien.objects.filter(date_heure__range=(start, end)).exclude(statut='annule').count()
        total_hires = Candidature.objects.filter(statut='retenu', date_postulation__range=(start, end)).count()

        from django.contrib.auth import get_user_model
        User = get_user_model()
        total_registrations = User.objects.filter(date_joined__range=(start, end)).count()

        KPISnapshot.objects.update_or_create(
            month=month,
            defaults={
                'total_interviews': total_interviews,
                'total_hires': total_hires,
                'total_registrations': total_registrations,
            },
        )
    except Exception as e:
        pass

    return f'Snapshot for {month.strftime("%Y-%m")}'