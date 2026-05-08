# Mixins pour les roles
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from django.shortcuts import render


class RoleRequiredMixin(LoginRequiredMixin, UserPassesTestMixin):
    allowed_roles = []

    def test_func(self):
        return self.request.user.role in self.allowed_roles

    def handle_no_permission(self):
        if self.request.user.is_authenticated:
            return render(self.request, '403.html', status=403)
        return super().handle_no_permission()


class AdminRequiredMixin(RoleRequiredMixin):
    allowed_roles = ['admin']


class RHOrAdminMixin(RoleRequiredMixin):
    allowed_roles = ['rh', 'admin']


class RecruteurMixin(RoleRequiredMixin):
    allowed_roles = ['recruteur', 'rh', 'admin']


class CandidatMixin(RoleRequiredMixin):
    allowed_roles = ['candidat']