# Configuration API DRF - remplacer Ninja
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from apps.accounts.viewsets import AuthViewSet, UserViewSet, AuditLogViewSet
from apps.offres.viewsets import OffreViewSet, CompetenceViewSet
from apps.candidatures.viewsets import CandidatureViewSet
from apps.entretiens.viewsets import EntretienViewSet
from apps.evaluations.viewsets import EvaluationViewSet
from apps.statistiques.viewsets import KPIViewSet, dashboard_stats

# Auth router
auth_router = DefaultRouter()
auth_router.register(r'', AuthViewSet, basename='auth')

# Main router
router = DefaultRouter()

# Accounts
router.register(r'users', UserViewSet, basename='users')
router.register(r'audit', AuditLogViewSet, basename='audit')

# Offres
router.register(r'offres', OffreViewSet, basename='offres')
router.register(r'competences', CompetenceViewSet, basename='competences')

# Candidatures
router.register(r'candidatures', CandidatureViewSet, basename='candidatures')

# Entretiens
router.register(r'entretiens', EntretienViewSet, basename='entretiens')

# Evaluations
router.register(r'evaluations', EvaluationViewSet, basename='evaluations')

# Statistiques
router.register(r'kpi', KPIViewSet, basename='kpi')

urlpatterns = [
    path('auth/', include(auth_router.urls)),
    path('statistiques/rh/', dashboard_stats, name='statistiques-rh'),
    path('', include(router.urls)),
]