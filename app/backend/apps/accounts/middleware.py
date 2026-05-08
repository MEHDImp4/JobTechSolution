"""
Middlewares pour la gestion de l'audit.
"""

from django.utils.deprecation import MiddlewareMixin

EXCLUDED_PATHS = [
    '/accounts/notes/save/',
    '/admin/',
    '/api/ia-status/',
    '/static/',
    '/media/',
    '/favicon.ico',
]

METHODS_TO_LOG = ['POST', 'PUT', 'PATCH', 'DELETE']

_ACTION_MAP = {
    'POST': 'CREATE',
    'PUT': 'UPDATE',
    'PATCH': 'UPDATE',
    'DELETE': 'DELETE',
}


class AuditMiddleware(MiddlewareMixin):
    """Enregistre les actions de modification (audit log)."""

    def process_request(self, request):
        if request.method in METHODS_TO_LOG:
            if not any(request.path.startswith(p) for p in EXCLUDED_PATHS):
                request._audit_start = True

    def process_response(self, request, response):
        if not getattr(request, '_audit_start', False):
            return response
        if response.status_code >= 400:
            return response

        # On récupère les infos avant que l'objet request ne soit plus accessible
        user = request.user if request.user.is_authenticated else None
        action = _ACTION_MAP.get(request.method, 'VIEW')
        model_name = self._extract_model(request.path)
        ip_address = self._get_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', '')[:500]
        endpoint = request.path[:255]

        from apps.accounts.tasks import create_audit_log

        create_audit_log.delay(
            user_id=user.id if user else None,
            action=action,
            model_name=model_name,
            ip_address=ip_address,
            user_agent=user_agent,
            endpoint=endpoint,
        )

        return response

    @staticmethod
    def _get_ip(request):
        """Récupère l'adresse IP de l'utilisateur."""
        forwarded = request.META.get('HTTP_X_FORWARDED_FOR', '').split(',')[0].strip()
        ip = forwarded or request.META.get('REMOTE_ADDR', '')
        return ip[:45] if ip else None

    @staticmethod
    def _extract_model(path):
        parts = path.split('/')
        non_empty = []
        for p in parts:
            if p:
                non_empty.append(p)
        return non_empty[0] if non_empty else 'unknown'
