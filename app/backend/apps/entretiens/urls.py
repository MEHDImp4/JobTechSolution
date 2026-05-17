from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import EntretienViewSet

router = DefaultRouter()
router.register('', EntretienViewSet, basename='interviews')

urlpatterns = [
    path('', include(router.urls)),
]
