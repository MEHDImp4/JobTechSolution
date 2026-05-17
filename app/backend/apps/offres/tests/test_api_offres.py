import json

from django.contrib.auth import get_user_model
from django.test import Client, TestCase

from apps.offres.models import Offre

User = get_user_model()


class OffreApiTest(TestCase):
    def setUp(self):
        self.client = Client()
        self.rh = User.objects.create_user(
            email='rh@example.com',
            nom='RH',
            prenom='User',
            password='password123',
            role='rh',
            is_active=True,
            is_email_verified=True,
        )
        self.candidat = User.objects.create_user(
            email='candidat@example.com',
            nom='Candidat',
            prenom='User',
            password='password123',
            role='candidat',
            is_active=True,
            is_email_verified=True,
        )
        Offre.objects.create(
            titre='Offre publiee',
            description='Visible',
            type_contrat='CDI',
            statut='publiee',
            created_by=self.rh,
            competences=['React'],
        )
        Offre.objects.create(
            titre='Offre brouillon',
            description='Hidden',
            type_contrat='CDD',
            statut='brouillon',
            created_by=self.rh,
            competences=['Django'],
        )

    def post_json(self, path, data):
        return self.client.post(path, data=json.dumps(data), content_type='application/json')

    def test_offres_require_authentication(self):
        response = self.client.get('/api/offres/')

        self.assertEqual(response.status_code, 403)

    def test_candidate_sees_only_published_offres(self):
        self.client.force_login(self.candidat)

        response = self.client.get('/api/offres/')

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload['count'], 1)
        self.assertEqual(payload['results'][0]['titre'], 'Offre publiee')

    def test_rh_sees_all_offres(self):
        self.client.force_login(self.rh)

        response = self.client.get('/api/offres/')

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['count'], 2)

    def test_rh_can_create_offre(self):
        self.client.force_login(self.rh)

        response = self.post_json(
            '/api/offres/',
            {
                'titre': 'Offre API',
                'description': 'Creation via test',
                'type_contrat': 'CDI',
                'competences': ['TypeScript'],
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertTrue(Offre.objects.filter(titre='Offre API').exists())

    def test_create_rejects_missing_required_fields(self):
        self.client.force_login(self.rh)

        response = self.post_json('/api/offres/', {'titre': 'Incomplete'})

        self.assertEqual(response.status_code, 400)
        self.assertIn('description', response.json())
