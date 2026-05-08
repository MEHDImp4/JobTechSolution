# Vues pour les comptes: inscription, activation, login
import csv
import io
import logging
import uuid

from django.contrib import messages
from django.contrib.auth import get_user_model
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.views import LoginView, LogoutView
from django.core.cache import cache
from django.db.models import Q
from django.http import JsonResponse
from django.shortcuts import redirect, render
from django.urls import reverse
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from django.views import View
from django.views.generic import ListView

from .forms import RegisterForm
from .mixins import AdminRequiredMixin
from .models import AuditLog
from .tokens import account_activation_token

logger = logging.getLogger(__name__)
User = get_user_model()


class UserListView(AdminRequiredMixin, ListView):
    """Admin only: list all users with filters."""

    model = User
    template_name = 'admin_custom/users.html'
    context_object_name = 'users'
    paginate_by = 25

    def get_queryset(self):
        qs = super().get_queryset().order_by('-date_joined')
        role = self.request.GET.get('role')
        status = self.request.GET.get('status')
        search = self.request.GET.get('search')

        if role:
            qs = qs.filter(role=role)
        if status == 'active':
            qs = qs.filter(is_active=True)
        elif status == 'inactive':
            qs = qs.filter(is_active=False)
        if search:
            qs = qs.filter(
                Q(nom__icontains=search) | Q(prenom__icontains=search) | Q(email__icontains=search)
            )
        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        ctx['roles'] = User.ROLES
        return ctx


class UserToggleActiveView(AdminRequiredMixin, View):
    """AJAX: toggle user active status and flush sessions if deactivated."""

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            user.is_active = not user.is_active
            user.save(update_fields=['is_active'])

            if not user.is_active:
                from django.contrib.sessions.models import Session
                from django.utils import timezone

                # Invalidate all user sessions
                sessions = Session.objects.filter(expire_date__gte=timezone.now())
                for session in sessions:
                    data = session.get_decoded()
                    if str(user.id) == data.get('_auth_user_id'):
                        session.delete()

            return JsonResponse({'success': True, 'is_active': user.is_active})
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User not found'}, status=404)


class UserRoleChangeView(AdminRequiredMixin, View):
    """AJAX: change user role and log to audit."""

    def post(self, request, pk):
        try:
            user = User.objects.get(pk=pk)
            old_role = user.role
            new_role = request.POST.get('role')
            if new_role not in dict(User.ROLES):
                return JsonResponse({'success': False, 'error': 'Invalid role'}, status=400)

            user.role = new_role
            user.save(update_fields=['role'])

            AuditLog.objects.create(
                user=request.user,
                action='UPDATE',
                model_name='User',
                object_id=user.id,
                data_before={'role': old_role},
                data_after={'role': new_role},
                ip_address=request.META.get('REMOTE_ADDR'),
                endpoint=request.path,
            )
            return JsonResponse({'success': True, 'role': new_role})
        except User.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'User not found'}, status=404)


class UserImportCSVView(AdminRequiredMixin, View):
    """Admin only: bulk import users from CSV."""

    def post(self, request):
        if 'csv_file' not in request.FILES:
            return JsonResponse({'success': False, 'error': 'No file uploaded'}, status=400)

        csv_file = request.FILES['csv_file']
        try:
            decoded = csv_file.read().decode('utf-8-sig')
            reader = csv.DictReader(io.StringIO(decoded))
            created, errors = 0, []

            for i, row in enumerate(reader):
                try:
                    email = row.get('email', '').strip()
                    if not email:
                        continue

                    User.objects.create_user(
                        email=email,
                        nom=row.get('nom', '').strip(),
                        prenom=row.get('prenom', '').strip(),
                        password=uuid.uuid4().hex,
                        role=row.get('role', 'candidat').strip(),
                        is_active=True,
                        is_email_verified=True,
                    )
                    created += 1
                except Exception as e:
                    errors.append(f'Ligne {i + 2}: {e!s}')

            return JsonResponse({'success': True, 'created': created, 'errors': errors})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)


class AuditLogListView(AdminRequiredMixin, ListView):
    """Admin only: view system audit logs with filters."""

    model = AuditLog
    template_name = 'admin_custom/audit_log.html'
    context_object_name = 'logs'
    paginate_by = 50

    def get_queryset(self):
        qs = super().get_queryset().select_related('user')

        user_id = self.request.GET.get('user_id')
        action = self.request.GET.get('action')
        model = self.request.GET.get('model_name')
        date_debut = self.request.GET.get('date_debut')
        date_fin = self.request.GET.get('date_fin')

        if user_id:
            qs = qs.filter(user_id=user_id)
        if action:
            qs = qs.filter(action=action)
        if model:
            qs = qs.filter(model_name=model)
        if date_debut:
            qs = qs.filter(timestamp__date__gte=date_debut)
        if date_fin:
            qs = qs.filter(timestamp__date__lte=date_fin)

        return qs

    def get_context_data(self, **kwargs):
        ctx = super().get_context_data(**kwargs)
        from .utils import compute_json_diff

        for log in ctx['logs']:
            log.diff = compute_json_diff(log.data_before, log.data_after)
        return ctx


class RegisterView(View):
    """
    Candidate self-registration.
    GET  — display the registration form.
    POST — validate, create inactive user, trigger activation email, redirect to success.
    """

    template_name = 'accounts/register.html'

    def get(self, request):
        if request.user.is_authenticated:
            return redirect('/')
        form = RegisterForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request):
        if request.user.is_authenticated:
            return redirect('/')

        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            # Send activation email asynchronously via Celery
            try:
                from apps.notifications.tasks import send_activation_email

                send_activation_email.delay(user.pk, request.get_host(), request.is_secure())
            except Exception:
                logger.exception('Failed to enqueue activation email for user pk=%s', user.pk)
            return redirect('accounts:register_success')

        return render(request, self.template_name, {'form': form})


class RegisterSuccessView(View):
    """
    Displayed after successful registration submission.
    Instructs the candidate to check their inbox.
    """

    template_name = 'accounts/register_success.html'

    def get(self, request):
        return render(request, self.template_name)


class ActivateAccountView(View):
    """
    Email activation link handler: /accounts/activate/<uidb64>/<token>/
    Validates token, activates user, redirects to login.
    """

    def get(self, request, uidb64, token):
        user = self._get_user(uidb64)

        if user is not None and account_activation_token.check_token(user, token):
            user.is_active = True
            user.is_email_verified = True
            user.save(update_fields=['is_active', 'is_email_verified'])
            messages.success(
                request,
                'Votre compte a été activé avec succès. Vous pouvez maintenant vous connecter.',
            )
            logger.info('Account activated for user pk=%s', user.pk)
            return redirect('accounts:login')

        messages.error(
            request,
            "Le lien d'activation est invalide ou a expiré. "
            'Veuillez vous réinscrire ou contacter le support.',
        )
        logger.warning('Invalid activation attempt with uidb64=%s', uidb64)
        return redirect('accounts:register')

    @staticmethod
    def _get_user(uidb64):
        """Decode uidb64 and return user or None."""
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            return User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return None


class CustomLoginView(LoginView):
    """
    Login view with Redis-backed brute-force protection.
    After 5 failed attempts the account is blocked for 15 minutes.
    Redirects to role-appropriate dashboard on success.
    """

    template_name = 'accounts/login.html'
    form_class = AuthenticationForm

    def form_valid(self, form):
        email = form.cleaned_data.get('username')
        cache_key = f'login_attempts:{email}'
        attempts = cache.get(cache_key, 0)
        if attempts >= 5:
            form.add_error(None, 'Compte bloqué. Réessayez dans 15 minutes.')
            return self.form_invalid(form)
        cache.delete(cache_key)
        return super().form_valid(form)

    def form_invalid(self, form):
        email = self.request.POST.get('username', '')

        # Specific check for inactive user to provide better feedback
        user = User.objects.filter(email=email).first()
        if user and not user.is_active:
            form.add_error(
                None,
                "Ce compte est inactif. Veuillez vérifier votre email pour l'activation.",
            )
            return super().form_invalid(form)

        cache_key = f'login_attempts:{email}'
        attempts = cache.get(cache_key, 0) + 1
        cache.set(cache_key, attempts, timeout=900)
        if attempts >= 4:
            remaining = 5 - attempts
            form.add_error(None, f'{remaining} tentative(s) restante(s) avant blocage.')
        return super().form_invalid(form)

    def get_success_url(self):
        user = self.request.user
        if user.is_admin:
            return reverse('admin:index')
        if user.is_rh:
            try:
                return reverse('rh:dashboard')
            except Exception:
                return '/'
        if user.is_recruteur:
            try:
                return reverse('recruteur:dashboard')
            except Exception:
                return '/'
        try:
            return reverse('candidat:dashboard')
        except Exception:
            return '/'


class CustomLogoutView(LogoutView):
    """Logout view that redirects to the login page."""

    next_page = 'accounts:login'
