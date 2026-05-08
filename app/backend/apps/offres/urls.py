"""
URL patterns for the offres app — Phase 2 Plan 1.
"""

from django.urls import path, include

from rest_framework.routers import DefaultRouter

from .views import (
    CompetenceAutocompleteView,
    OffreCreateView,
    OffreDeleteView,
    OffreDetailView,
    OffreListView,
    OffrePublishView,
    OffreSearchView,
    OffreUpdateView,
)
from .viewsets import OffreViewSet, CompetenceViewSet

app_name = 'offres'

router = DefaultRouter()
router.register(r'api', OffreViewSet, basename='offre')
router.register(r'competences', CompetenceViewSet, basename='competence')

urlpatterns = [
    # Keep CBV routes for template views
    path('', OffreListView.as_view(), name='list'),
    path('recherche/', OffreSearchView.as_view(), name='search'),
    path('creer/', OffreCreateView.as_view(), name='create'),
    path(
        'competences/autocomplete/',
        CompetenceAutocompleteView.as_view(),
        name='competences_autocomplete',
    ),
    path('<int:pk>/', OffreDetailView.as_view(), name='detail'),
    path('<int:pk>/modifier/', OffreUpdateView.as_view(), name='update'),
    path('<int:pk>/supprimer/', OffreDeleteView.as_view(), name='delete'),
    path('<int:pk>/publier/', OffrePublishView.as_view(), name='publish'),
    # API routes
    path('', include(router.urls)),
]