"""
Evaluations URL configuration — Phase 6 Plan 1.
"""

from django.urls import path, include

from rest_framework.routers import DefaultRouter

from . import views
from .viewsets import EvaluationViewSet

app_name = 'evaluations'

router = DefaultRouter()
router.register(r'api', EvaluationViewSet, basename='evaluation')

urlpatterns = [
    # Keep CBV routes for template views
    path('creer/<int:entretien_pk>/', views.EvaluationCreateView.as_view(), name='create'),
    path('<int:pk>/', views.EvaluationDetailView.as_view(), name='detail'),
    # DRF API routes
    path('', include(router.urls)),
]
