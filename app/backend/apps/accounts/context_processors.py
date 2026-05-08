"""
Template context processors for accounts / RBAC.
Adds user_role and permission flags to every template context.
"""


def user_permissions(request):
    """
    Inject RBAC permission flags into every template context.
    Returns an empty dict for anonymous users.
    """
    if not request.user.is_authenticated:
        return {}

    role = request.user.role
    return {
        'user_role': role,
        'can_manage_offers': role in ['rh', 'admin'],
        'can_view_candidatures': role in ['recruteur', 'rh', 'admin'],
    }
