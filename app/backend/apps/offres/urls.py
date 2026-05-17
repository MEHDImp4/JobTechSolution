from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import OffreViewSet

router = DefaultRouter()
router.register('', OffreViewSet, basename='jobs')

urlpatterns = [
    path('', include(router.urls)),
]
