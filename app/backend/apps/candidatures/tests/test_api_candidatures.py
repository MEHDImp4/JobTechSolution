from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import Client, TestCase

from apps.candidatures.models import Candidature
from apps.offres.models import Offre

User = get_user_model()


class CandidatureApiTest(TestCase):
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
        self.other_candidate = User.objects.create_user(
            email='other@example.com',
            nom='Other',
            prenom='Candidate',
            password='password123',
            role='candidat',
            is_active=True,
            is_email_verified=True,
        )
        self.offre = Offre.objects.create(
            titre='Offre candidature',
            description='Description',
            type_contrat='CDI',
            statut='publiee',
            created_by=self.rh,
            competences=['React'],
        )

    def build_cv(self, name='cv.pdf'):
        return SimpleUploadedFile(name, b'%PDF-1.4 test pdf', content_type='application/pdf')

    def test_candidate_can_create_application(self):
        self.client.force_login(self.candidat)

        response = self.client.post(
            '/api/candidatures/',
            {
                'offre': str(self.offre.id),
                'cv_file': self.build_cv(),
                'lettre_motivation': 'Motivation solide',
            },
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(Candidature.objects.count(), 1)
        self.assertEqual(Candidature.objects.get().candidat, self.candidat)

    def test_duplicate_application_returns_400(self):
        Candidature.objects.create(
            offre=self.offre,
            candidat=self.candidat,
            cv_file=self.build_cv('existing.pdf'),
            lettre_motivation='Existante',
        )
        self.client.force_login(self.candidat)

        response = self.client.post(
            '/api/candidatures/',
            {
                'offre': str(self.offre.id),
                'cv_file': self.build_cv('duplicate.pdf'),
                'lettre_motivation': 'Duplicate',
            },
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()['message'], 'Vous avez deja poste a cette offre.')

    def test_candidate_list_is_scoped_to_self(self):
        Candidature.objects.create(
            offre=self.offre,
            candidat=self.candidat,
            cv_file=self.build_cv('mine.pdf'),
            lettre_motivation='Mine',
        )
        Candidature.objects.create(
            offre=self.offre,
            candidat=self.other_candidate,
            cv_file=self.build_cv('other.pdf'),
            lettre_motivation='Other',
        )
        self.client.force_login(self.candidat)

        response = self.client.get('/api/candidatures/')

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload['count'], 1)
        self.assertEqual(payload['results'][0]['candidat_email'], self.candidat.email)

    def test_rh_can_change_application_status(self):
        candidature = Candidature.objects.create(
            offre=self.offre,
            candidat=self.candidat,
            cv_file=self.build_cv('status.pdf'),
            lettre_motivation='Status',
        )
        self.client.force_login(self.rh)

        response = self.client.post(
            f'/api/candidatures/{candidature.id}/statut/',
            {'statut': 'entretien'},
        )

        self.assertEqual(response.status_code, 200)
        candidature.refresh_from_db()
        self.assertEqual(candidature.statut, 'entretien')

    def test_candidate_cannot_change_application_status(self):
        candidature = Candidature.objects.create(
            offre=self.offre,
            candidat=self.candidat,
            cv_file=self.build_cv('forbidden.pdf'),
            lettre_motivation='Forbidden',
        )
        self.client.force_login(self.candidat)

        response = self.client.post(
            f'/api/candidatures/{candidature.id}/statut/',
            {'statut': 'entretien'},
        )

        self.assertEqual(response.status_code, 403)
