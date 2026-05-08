"""
URL routes for the IA app — Phase 9 Plan 1.
Namespace: ia
"""

from django.urls import path

from .api import CandidatureDetailView, CvSummaryAPIView

app_name = 'ia'

urlpatterns = [
    # JSON API: resume_ia + scoring data
    path(
        'candidatures/<int:pk>/summary/',
        CvSummaryAPIView.as_view(),
        name='cv_summary',
    ),
    # HTML detail page with Résumé IA card (RH only)
    path(
        'candidatures/<int:pk>/detail/',
        CandidatureDetailView.as_view(),
        name='candidature_detail',
    ),
]
