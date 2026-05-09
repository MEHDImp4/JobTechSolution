from django.contrib.auth import get_user_model
from django.test import Client, TestCase

User = get_user_model()


class AuthApiLoginTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.login_url = '/api/auth/login/'

    def test_login_returns_user_for_active_account(self):
        user = User.objects.create_user(
            email='active@example.com',
            nom='Active',
            prenom='User',
            password='password123',
            role='candidat',
            is_active=True,
            is_email_verified=True,
        )

        response = self.client.post(
            self.login_url,
            data={'email': user.email, 'password': 'password123'},
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['email'], user.email)

    def test_login_returns_specific_message_for_inactive_account(self):
        user = User.objects.create_user(
            email='inactive@example.com',
            nom='Inactive',
            prenom='User',
            password='password123',
            role='candidat',
            is_active=False,
            is_email_verified=False,
        )

        response = self.client.post(
            self.login_url,
            data={'email': user.email, 'password': 'password123'},
            content_type='application/json',
        )

        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()['code'], 'account_inactive')
