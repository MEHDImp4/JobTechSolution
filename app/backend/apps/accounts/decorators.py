# Decorateurs RBAC simples
from django.contrib.auth.decorators import user_passes_test
from django.shortcuts import render


def role_required(*roles):
    def check_role(user):
        return user.role in roles
    return user_passes_test(check_role)


def admin_required(view_func):
    def check_admin(user):
        return user.is_staff
    return user_passes_test(check_admin)(view_func)


def rh_required(view_func):
    def check_rh(user):
        return user.role in ['rh', 'admin']
    return user_passes_test(check_rh)(view_func)