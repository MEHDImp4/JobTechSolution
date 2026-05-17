"""
URL routes for the candidatures app.
Namespace: candidat
"""

from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    CandidatDashboardView,
    CandidatureCreateView,
    CandidatureWizardView,
    IaStatusView,
)
from .viewsets import CandidatureViewSet

app_name = 'candidat'

router = DefaultRouter()
router.register(r'api', CandidatureViewSet, basename='candidature')

urlpatterns = [
    # Keep CBV routes for template views
    path('dashboard/', CandidatDashboardView.as_view(), name='dashboard'),
    path('upload/', CandidatureCreateView.as_view(), name='upload'),
    path('postuler/', CandidatureWizardView.as_view(), name='postuler'),
    path('<int:pk>/ia-status/', IaStatusView.as_view(), name='ia_status'),
    # API routes
    path('', include(router.urls)),
]
