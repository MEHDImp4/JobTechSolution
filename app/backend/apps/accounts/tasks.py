from celery import shared_task
from django.db import connections


@shared_task(name='apps.accounts.tasks.create_audit_log')
def create_audit_log(user_id, action, model_name, ip_address, user_agent, endpoint):
    """Enregistre une entrée dans les logs d'audit de manière asynchrone."""
    from apps.accounts.models import AuditLog, User

    try:
        user = User.objects.get(pk=user_id) if user_id else None

        AuditLog.objects.create(
            user=user,
            action=action,
            model_name=model_name,
            ip_address=ip_address,
            user_agent=user_agent,
            endpoint=endpoint,
        )
    except Exception:
        pass
    finally:
        connections.close_all()


@shared_task(name='apps.accounts.tasks.cleanup_expired_data')
def cleanup_expired_data():
    """Anonymise les données des candidats de plus de 24 mois."""
    from datetime import timedelta

    from django.utils import timezone

    from apps.accounts.models import User

    threshold = timezone.now() - timedelta(days=24 * 30)  # ~24 mois

    expired_users = User.objects.filter(role='candidat', date_joined__lt=threshold).exclude(
        is_superuser=True
    )

    count = expired_users.count()
    for user in expired_users:
        # Anonymisation des informations personnelles
        user.email = f'anonymized_{user.pk}@jobtech.internal'
        user.nom = 'Anonyme'
        user.prenom = 'Candidat'
        if hasattr(user, 'phone'):
            user.phone = ''
        user.save()

    return f'Anonymised {count} expired candidates.'
