import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase

User = get_user_model()


class AuthEndpointsTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.user = User.objects.create_user(
            email='rh@example.com',
            nom='RH',
            prenom='User',
            password='password123',
            role='rh',
            is_active=True,
            is_email_verified=True,
        )

    def post_json(self, path, data):
        return self.client.post(path, data=json.dumps(data), content_type='application/json')

    def patch_json(self, path, data):
        return self.client.patch(path, data=json.dumps(data), content_type='application/json')

    def test_me_returns_authenticated_false_when_logged_out(self):
        response = self.client.get('/api/auth/me/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {'authenticated': False})

    def test_login_then_me_returns_connected_user(self):
        login_response = self.post_json(
            '/api/auth/login/',
            {'email': self.user.email, 'password': 'password123'},
        )
        me_response = self.client.get('/api/auth/me/')

        self.assertEqual(login_response.status_code, 200)
        self.assertEqual(me_response.status_code, 200)
        self.assertTrue(me_response.json()['authenticated'])
        self.assertEqual(me_response.json()['user']['email'], self.user.email)

    def test_register_creates_new_candidate_account(self):
        response = self.post_json(
            '/api/auth/register/',
            {
                'email': 'new-candidate@example.com',
                'nom': 'New',
                'prenom': 'Candidate',
                'password': 'password123',
                'password_confirm': 'password123',
            },
        )

        self.assertEqual(response.status_code, 201)
        created = User.objects.get(email='new-candidate@example.com')
        self.assertEqual(created.role, 'candidat')
        self.assertTrue(created.is_active)
        self.assertTrue(created.is_email_verified)

    def test_register_rejects_duplicate_email(self):
        # Create a user first
        User.objects.create_user(
            email='duplicate@example.com',
            nom='Existing',
            prenom='User',
            password='password123'
        )
        
        # Try to register with same email
        response = self.post_json(
            '/api/auth/register/',
            {
                'email': 'duplicate@example.com',
                'nom': 'New',
                'prenom': 'User',
                'password': 'password123',
                'password_confirm': 'password123',
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn('email', response.json())

    def test_profile_update_accepts_partial_patch(self):
        self.client.force_login(self.user)

        response = self.patch_json('/api/auth/me/', {'phone': '0600000000'})

        self.assertEqual(response.status_code, 200)
        self.user.refresh_from_db()
        self.assertEqual(self.user.phone, '0600000000')
