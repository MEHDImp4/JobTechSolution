"""
URL routes for the accounts app.
Namespace: accounts
"""

from django.contrib.auth import views as auth_views
from django.urls import path, include

from rest_framework.routers import DefaultRouter

from .views import (
    ActivateAccountView,
    AuditLogListView,
    CustomLoginView,
    CustomLogoutView,
    RegisterSuccessView,
    RegisterView,
    UserImportCSVView,
    UserListView,
    UserRoleChangeView,
    UserToggleActiveView,
)
from .viewsets import UserViewSet, AuditLogViewSet

app_name = 'accounts'

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    # API routes
    path('api/', include(router.urls)),
    # Registration
    path('register/', RegisterView.as_view(), name='register'),
    path('register/success/', RegisterSuccessView.as_view(), name='register_success'),
    path(
        'activate/<uidb64>/<token>/',
        ActivateAccountView.as_view(),
        name='activate',
    ),
    # Registration
    path('register/', RegisterView.as_view(), name='register'),
    path('register/success/', RegisterSuccessView.as_view(), name='register_success'),
    path(
        'activate/<uidb64>/<token>/',
        ActivateAccountView.as_view(),
        name='activate',
    ),
    # Authentication
    path('login/', CustomLoginView.as_view(), name='login'),
    path('logout/', CustomLogoutView.as_view(), name='logout'),
    # Admin User Management
    path('admin/users/', UserListView.as_view(), name='user_list'),
    path(
        'admin/users/<int:pk>/toggle/',
        UserToggleActiveView.as_view(),
        name='user_toggle',
    ),
    path('admin/users/<int:pk>/role/', UserRoleChangeView.as_view(), name='user_role'),
    path('admin/users/import/', UserImportCSVView.as_view(), name='user_import'),
    path('admin/audit/', AuditLogListView.as_view(), name='audit_log'),
    # Password reset
    path(
        'password-reset/',
        auth_views.PasswordResetView.as_view(
            template_name='accounts/password_reset.html',
            email_template_name='accounts/password_reset_email.txt',
            subject_template_name='accounts/password_reset_subject.txt',
        ),
        name='password_reset',
    ),
    path(
        'password-reset/done/',
        auth_views.PasswordResetDoneView.as_view(
            template_name='accounts/password_reset_done.html',
        ),
        name='password_reset_done',
    ),
    path(
        'password-reset/confirm/<uidb64>/<token>/',
        auth_views.PasswordResetConfirmView.as_view(
            template_name='accounts/password_reset_confirm.html',
        ),
        name='password_reset_confirm',
    ),
    path(
        'password-reset/complete/',
        auth_views.PasswordResetCompleteView.as_view(
            template_name='accounts/password_reset_complete.html',
        ),
        name='password_reset_complete',
    ),
]
