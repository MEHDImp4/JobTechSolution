"""
Token generator for account email activation.
Uses Django's PasswordResetTokenGenerator with six-based timestamp encoding.
"""

import six
from django.contrib.auth.tokens import PasswordResetTokenGenerator


class AccountActivationTokenGenerator(PasswordResetTokenGenerator):
    """
    Generate a one-use token for account email activation.
    Token is invalidated once the account is activated (is_active=True, is_email_verified=True).
    """

    def _make_hash_value(self, user, timestamp):
        # Include activation state so token is invalidated after use
        return (
            six.text_type(user.pk)
            + six.text_type(timestamp)
            + six.text_type(user.is_active)
            + six.text_type(user.is_email_verified)
        )


account_activation_token = AccountActivationTokenGenerator()
