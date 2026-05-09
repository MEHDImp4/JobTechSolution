"""
URL configuration for JobTech Solutions.
"""

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path
from django.views.generic import TemplateView

from .api import urlpatterns as apiurlpatterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(apiurlpatterns)),
    path('webpush/', include('webpush.urls')),
    # App URLs for traditional Django views
    path('accounts/', include('apps.accounts.urls', namespace='accounts')),
    path('offres/', include('apps.offres.urls', namespace='offres')),
    path('candidat/', include('apps.candidatures.urls', namespace='candidat')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if not settings.DEBUG:
    urlpatterns += [
        re_path(r'^.*$', TemplateView.as_view(template_name='index.html'), name='index'),
    ]