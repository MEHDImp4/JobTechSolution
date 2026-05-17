from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('accounts/', include('apps.accounts.urls')),
    path('jobs/', include('apps.offres.urls')),
    path('applications/', include('apps.candidatures.urls')),
    path('interviews/', include('apps.entretiens.urls')),
    path('reports/', include('apps.rapports.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
