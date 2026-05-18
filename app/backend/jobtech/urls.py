from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('apps.accounts.urls')),
    path('users/', include('apps.accounts.urls_users')),
    path('audit/', include('apps.accounts.urls_audit')),
    path('offres/', include('apps.offres.urls')),
    path('candidatures/', include('apps.candidatures.urls')),
    path('entretiens/', include('apps.entretiens.urls')),
    path('evaluations/', include('apps.entretiens.urls_evaluations')),
    path('statistiques/', include('apps.rapports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
