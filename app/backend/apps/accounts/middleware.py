from .models import AuditLog


class AuditLogMiddleware:
    ignored_prefixes = (
        '/audit/',
        '/accounts/login/',
        '/accounts/logout/',
        '/accounts/register/',
        '/users/',
    )

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)

        # Garde un audit simple sur les actions qui modifient des donnees.
        if request.method not in {'POST', 'PUT', 'PATCH', 'DELETE'}:
            return response

        if response.status_code >= 400 or not request.user.is_authenticated:
            return response

        if request.path.startswith(self.ignored_prefixes):
            return response

        action_map = {
            'POST': 'CREATE',
            'PUT': 'UPDATE',
            'PATCH': 'UPDATE',
            'DELETE': 'DELETE',
        }

        AuditLog.objects.create(
            user=request.user,
            user_email=request.user.email,
            action=action_map.get(request.method, request.method),
            model_name=request.resolver_match.view_name if request.resolver_match else '',
            endpoint=request.path,
            ip_address=self._get_ip_address(request),
        )
        return response

    def _get_ip_address(self, request):
        forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if forwarded_for:
            return forwarded_for.split(',')[0].strip()
        return request.META.get('REMOTE_ADDR')
