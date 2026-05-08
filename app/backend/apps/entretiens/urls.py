"""
URL patterns for the entretiens app — Phase 5 Plan 1.
"""

from django.urls import path, include

from rest_framework.routers import DefaultRouter

from . import views
from .viewsets import EntretienViewSet

app_name = 'entretiens'

router = DefaultRouter()
router.register(r'vcs', EntretienViewSet, basename='entretien')

urlpatterns = [
    # Keep CBV routes for template views
    path('', views.CalendrierView.as_view(), name='calendrier'),
    path('api/', views.EntretienAPIView.as_view(), name='api'),
    path('create/', views.EntretienCreateView.as_view(), name='create'),
    path('<int:pk>/', views.ConduiteEntretienView.as_view(), name='conduire'),
    path('<int:pk>/notes/save/', views.NotesSaveView.as_view(), name='notes_save'),
    path('<int:pk>/cloturer/', views.ClotureEntretienView.as_view(), name='cloturer'),
    # DRF API routes
    path('', include(router.urls)),
]
