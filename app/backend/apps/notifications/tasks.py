# Taches Celery pour les emails
from celery import shared_task
from django.contrib.auth import get_user_model
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
import re

MAX_RETRIES = 3
RETRY_DELAY = 60


def _send_email(to_email, subject, html_body):
    text_body = re.sub(r'<[^>]+>', '', html_body)
    email = EmailMultiAlternatives(subject=subject, body=text_body, to=[to_email])
    email.attach_alternative(html_body, 'text/html')
    email.send(fail_silently=False)


def _log_notif(recipient, status='PENDING', error_message=None, attempts=1):
    from apps.notifications.models import NotificationLog
    NotificationLog.objects.create(
        recipient=recipient, type='EMAIL', status=status,
        error_message=error_message, attempts=attempts)


@shared_task(bind=True, max_retries=MAX_RETRIES, queue='email_queue')
def send_activation_email(self, user_pk, domain, use_https=False):
    from apps.accounts.tokens import account_activation_token
    User = get_user_model()

    try:
        user = User.objects.get(pk=user_pk)
    except User.DoesNotExist:
        return

    protocol = 'https' if use_https else 'http'
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = account_activation_token.make_token(user)

    context = {
        'user': user, 'protocol': protocol, 'domain': domain,
        'uid': uid, 'token': token,
        'activation_url': f'{protocol}://{domain}/accounts/activate/{uid}/{token}/',
    }

    subject = 'Activez votre compte JobTech Solutions'
    html_body = render_to_string('emails/activation.html', context)

    try:
        _send_email(user.email, subject, html_body)
        _log_notif(user.email, status='SENT', attempts=self.request.retries + 1)
    except Exception as exc:
        _log_notif(user.email, status='FAILED', error_message=str(exc), attempts=self.request.retries + 1)
        raise self.retry(exc=exc, countdown=RETRY_DELAY * (2 ** self.request.retries))


@shared_task(bind=True, max_retries=MAX_RETRIES, queue='email_queue')
def send_interview_notification(self, entretien_id):
    from apps.entretiens.models import Entretien

    try:
        entretien = Entretien.objects.select_related('candidat', 'recruteur').get(pk=entretien_id)
    except Entretien.DoesNotExist:
        return

    date_fr = entretien.date_heure.strftime('%d/%m/%Y a %H:%M')

    try:
        html = render_to_string('emails/interview_candidat.html', {'entretien': entretien, 'date_fr': date_fr})
        _send_email(entretien.candidat.email, 'Votre entretien a ete planifie', html)
        _log_notif(entretien.candidat.email, status='SENT')

        html2 = render_to_string('emails/interview_recruteur.html', {'entretien': entretien, 'date_fr': date_fr})
        _send_email(entretien.recruteur.email, f'Entretien avec {entretien.candidat.get_full_name}', html2)
        _log_notif(entretien.recruteur.email, status='SENT')
    except Exception as exc:
        _log_notif(entretien.candidat.email, status='FAILED', error_message=str(exc))
        raise self.retry(exc=exc, countdown=RETRY_DELAY * (2 ** self.request.retries))


@shared_task(name='send_interview_reminders')
def send_interview_reminders(days_ahead=1):
    from datetime import timedelta
    from django.utils import timezone
    from apps.entretiens.models import Entretien

    now = timezone.now()
    target = (now + timedelta(days=days_ahead)).replace(hour=0, minute=0, second=0, microsecond=0)
    target_end = target + timedelta(days=1)

    entretiens = Entretien.objects.filter(date_heure__range=[target, target_end], statut='planifie')
    subject = 'demain' if days_ahead == 1 else f'dans {days_ahead} jours'

    for entretien in entretiens:
        try:
            html = render_to_string('emails/reminder.html', {'entretien': entretien, 'days_ahead': days_ahead})
            _send_email(entretien.candidat.email, f'Rappel : Entretien {subject}', html)
            _send_email(entretien.recruteur.email, f'Rappel : Entretien {subject}', html)
        except Exception as exc:
            _log_notif(entretien.candidat.email, status='FAILED', error_message=str(exc))


@shared_task(bind=True, max_retries=MAX_RETRIES, queue='email_queue')
def send_decision_email(self, candidature_id, decision):
    from apps.candidatures.models import Candidature

    try:
        candidature = Candidature.objects.select_related('candidat', 'offre').get(pk=candidature_id)
    except Candidature.DoesNotExist:
        return

    try:
        template = 'emails/decision_retenu.html' if decision == 'retenu' else 'emails/decision_refuse.html'
        subject = 'Felicitations!' if decision == 'retenu' else f'Suivi de votre candidature - {candidature.offre.titre}'
        html = render_to_string(template, {'candidature': candidature})
        _send_email(candidature.candidat.email, subject, html)
        _log_notif(candidature.candidat.email, status='SENT')
    except Exception as exc:
        _log_notif(candidature.candidat.email, status='FAILED', error_message=str(exc))
        raise self.retry(exc=exc, countdown=RETRY_DELAY * (2 ** self.request.retries))