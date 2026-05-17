from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import LoginView, LogoutView, ProfileView, RegisterView, UserViewSet

router = DefaultRouter()
router.register('users', UserViewSet, basename='users')

urlpatterns = [
    path('register/', RegisterView.as_view()),
    path('login/', LoginView.as_view()),
    path('logout/', LogoutView.as_view()),
    path('profile/', ProfileView.as_view()),
    path('', include(router.urls)),
]
