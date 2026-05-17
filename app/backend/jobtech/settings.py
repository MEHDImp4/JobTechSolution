"""
Django settings for jobtech project.
Phase 1 — Plan 1: Initial configuration with MySQL, RBAC, and Celery.
"""

import os
import sys
from pathlib import Path

import dj_database_url

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

import environ

env = environ.Env()
environ.Env.read_env(BASE_DIR.parent / '.env')

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = env('SECRET_KEY', default='jobtech-local-test-secret-key')

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = env.bool('DEBUG', default=False)

# Add mock_libs to path (only in DEBUG to avoid masking real packages in production)
if DEBUG:
    sys.path.insert(0, os.path.join(BASE_DIR, 'mock_libs'))

ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['*'] if DEBUG else [])

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Project apps
    'apps.accounts',
    'apps.offres',
    'apps.candidatures',
    'apps.ia',
    'apps.entretiens',
    'apps.evaluations',
    'apps.rapports',
    'apps.statistiques',
    'apps.notifications',
    'webpush',
    # Third-party
    'django_celery_results',
    'django_filters',
    'formtools',
    'corsheaders',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'apps.accounts.middleware.AuditMiddleware',
]

ROOT_URLCONF = 'jobtech.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            BASE_DIR / 'templates',
            BASE_DIR.parent / 'frontend' / 'dist',
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'apps.accounts.context_processors.user_permissions',
            ],
        },
    },
]

WSGI_APPLICATION = 'jobtech.wsgi.application'

# Database — MySQL via DATABASE_URL, fallback to SQLite for local dev
_SQLITE_FALLBACK = {
    'ENGINE': 'django.db.backends.sqlite3',
    'NAME': BASE_DIR / 'db.sqlite3',
}

# FORCE SQLITE FOR E2E TESTING
DATABASES = {'default': _SQLITE_FALLBACK}

_DATABASE_URL = env('DATABASE_URL', default=None)

# Force SQLite for tests
if _DATABASE_URL:
    # Auto-convert postgres URL to mysql for this pivot phase if user didn't update .env
    if _DATABASE_URL.startswith('postgres'):
        _DATABASE_URL = (
            _DATABASE_URL.replace('postgresql://', 'mysql://')
            .replace('postgres://', 'mysql://')
            .replace(':5432/', ':3306/')
        )

    # Use MySQL 8.0 drivers and ensure persistent connections
    DATABASES = {
        'default': dj_database_url.parse(
            _DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
    # Forcer utf8mb4 pour supporter les emojis (MySQL 8.0)
    DATABASES['default']['OPTIONS'] = {
        'charset': 'utf8mb4',
        'use_unicode': True,
    }
else:
    DATABASES = {'default': _SQLITE_FALLBACK}

# Custom user model
AUTH_USER_MODEL = 'accounts.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'fr-fr'
TIME_ZONE = 'Africa/Casablanca'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_DIRS = [
    BASE_DIR / 'static',
]

frontend_dist = BASE_DIR.parent / 'frontend' / 'dist'
if frontend_dist.exists():
    STATICFILES_DIRS.append(frontend_dist)

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Default primary key field type
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Authentication
LOGIN_URL = '/accounts/login/'
LOGIN_REDIRECT_URL = '/'
LOGOUT_REDIRECT_URL = '/accounts/login/'

# Cache — Local Memory for easier local dev
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
    }
}
# Store sessions in DB with cache acceleration.
# Pure cache-backed sessions are too fragile here and were causing
# authenticated users to lose their session on the next request.
SESSION_ENGINE = 'django.contrib.sessions.backends.cached_db'
SESSION_CACHE_ALIAS = 'default'

# Celery
CELERY_BROKER_URL = env('REDIS_URL', default='redis://localhost:6379/0')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_CACHE_BACKEND = 'default'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = 'Africa/Casablanca'
CELERY_TASK_ALWAYS_EAGER = False
CELERY_TASK_EAGER_PROPAGATES = True

CELERY_TASK_ROUTES = {
    'apps.ia.tasks.*': {'queue': 'ia_queue'},
    'apps.notifications.tasks.*': {'queue': 'email_queue'},
    'apps.rapports.tasks.*': {'queue': 'pdf_queue'},
}

from celery.schedules import crontab

CELERY_BEAT_SCHEDULE = {
    'cleanup-expired-candidate-data': {
        'task': 'apps.accounts.tasks.cleanup_expired_data',
        'schedule': crontab(day_of_week=0, hour=0, minute=0),  # Weekly on Sunday
    },
    'generate-monthly-kpi-snapshot': {
        'task': 'apps.statistiques.tasks.generate_monthly_snapshot',
        'schedule': crontab(day_of_month=1, hour=0, minute=0),
    },
    'send-interview-reminders-j1': {
        'task': 'apps.notifications.tasks.send_interview_reminders',
        'schedule': crontab(hour=8, minute=0),
        'args': (1,),  # J-1
    },
    'send-interview-reminders-j2': {
        'task': 'apps.notifications.tasks.send_interview_reminders',
        'schedule': crontab(hour=8, minute=0),
        'args': (2,),  # J-2
    },
}

# Email
if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'
else:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'

EMAIL_HOST = env('EMAIL_HOST', default='smtp.gmail.com')
EMAIL_PORT = env.int('EMAIL_PORT', default=587)
EMAIL_USE_TLS = env.bool('EMAIL_USE_TLS', default=True)
EMAIL_HOST_USER = env('EMAIL_HOST_USER', default='')
EMAIL_HOST_PASSWORD = env('EMAIL_HOST_PASSWORD', default='')
DEFAULT_FROM_EMAIL = EMAIL_HOST_USER

# LLM Integration (Phase 9 — CV summarization via NVIDIA NIM)
NVIDIA_API_KEY = env('NVIDIA_API_KEY', default='')

# CORS configuration
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
CORS_ALLOW_CREDENTIALS = True

# CSRF Trusted Origins (Required for Django 4.0+)
CSRF_TRUSTED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5174',
    'http://localhost:5175',
    'http://127.0.0.1:5175',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'http://10.123.222.129:5173',  # Local machine IP
]

# Proactively add all current allowed origins to CSRF trusted origins if in DEBUG
if DEBUG:
    # This is a bit of a hack but helpful for local dev with dynamic IPs
    # Note: CSRF_TRUSTED_ORIGINS requires the scheme (http:// or https://)
    pass

# CSRF & Sessions
SESSION_COOKIE_SAMESITE = 'Lax'
CSRF_COOKIE_SAMESITE = 'Lax'
SESSION_COOKIE_HTTPONLY = True

if not DEBUG:
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    SECURE_HSTS_SECONDS = 31536000  # 1 year
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
    SECURE_SSL_REDIRECT = env.bool('SECURE_SSL_REDIRECT', default=True)
else:
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    SECURE_SSL_REDIRECT = False

# Allow Cross-Origin for development
CORS_ALLOW_ALL_ORIGINS = DEBUG  # Allow all origins if in debug mode

# WebPush config
if DEBUG:
    WEBPUSH_SETTINGS = {
        'VAPID_PUBLIC_KEY': env('VAPID_PUBLIC_KEY', default='BCx_DummyPublicKey_ReplaceInProd'),
        'VAPID_PRIVATE_KEY': env('VAPID_PRIVATE_KEY', default='DummyPrivateKey_ReplaceInProd'),
        'VAPID_ADMIN_EMAIL': env('VAPID_ADMIN_EMAIL', default='admin@example.com'),
    }
else:
    WEBPUSH_SETTINGS = {
        'VAPID_PUBLIC_KEY': env('VAPID_PUBLIC_KEY', default='BCx_DummyPublicKey_ReplaceInProd'),
        'VAPID_PRIVATE_KEY': env('VAPID_PRIVATE_KEY', default='DummyPrivateKey_ReplaceInProd'),
        'VAPID_ADMIN_EMAIL': env('VAPID_ADMIN_EMAIL', default='admin@example.com'),
    }

# --- TEST OVERRIDES ---
if 'test' in sys.argv:
    # Use SQLite in-memory for speed and reliability in CI
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': ':memory:',
        }
    }
    # Disable security redirects and strict cookies during tests
    # This prevents 301 redirects and auth failures in non-HTTPS test environments
    SECURE_SSL_REDIRECT = False
    SESSION_COOKIE_SECURE = False
    CSRF_COOKIE_SECURE = False
    CELERY_TASK_ALWAYS_EAGER = True
    # Use dummy VAPID keys if not provided, to avoid ImproperlyConfigured errors
    WEBPUSH_SETTINGS = {
        'VAPID_PUBLIC_KEY': env('VAPID_PUBLIC_KEY', default='BCx_DummyPublicKey_ReplaceInProd'),
        'VAPID_PRIVATE_KEY': env('VAPID_PRIVATE_KEY', default='DummyPrivateKey_ReplaceInProd'),
        'VAPID_ADMIN_EMAIL': env('VAPID_ADMIN_EMAIL', default='admin@example.com'),
    }
