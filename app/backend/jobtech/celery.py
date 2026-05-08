"""
Celery configuration for JobTech Solutions.
"""

import os

from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'jobtech.settings')

app = Celery('jobtech')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()
