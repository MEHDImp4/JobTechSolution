from io import BytesIO
from datetime import timedelta

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from django.utils import timezone
from reportlab.pdfgen import canvas
from rest_framework import status
from rest_framework.test import APITestCase

from apps.accounts.models import User
from apps.candidatures.models import Candidature
from apps.entretiens.models import Entretien
from apps.offres.models import Offre


@override_settings(MEDIA_ROOT='C:/Users/mehdi/Documents/GitHub/JobTechSolution/app/backend/test_media')
class MinimalBackendTests(APITestCase):
    def build_cv_pdf(self, lines):
        buffer = BytesIO()
        pdf = canvas.Canvas(buffer)
        y = 800
        for line in lines:
            pdf.drawString(50, y, line)
            y -= 20
        pdf.save()
        buffer.seek(0)
        return buffer.getvalue()

    def setUp(self):
        self.rh = User.objects.create_user(
            username='rhuser',
            email='rh@example.com',
            password='StrongPass123',
            nom='RH',
            prenom='User',
            role=User.ROLE_RH,
        )
        self.candidat = User.objects.create_user(
            username='candidate',
            email='candidate@example.com',
            password='StrongPass123',
            nom='Candidate',
            prenom='User',
            role=User.ROLE_CANDIDAT,
        )

    def test_register_login_and_profile(self):
        register_response = self.client.post(
            '/accounts/register/',
            {
                'email': 'newcandidate@example.com',
                'nom': 'New',
                'prenom': 'Candidate',
                'password': 'StrongPass123',
                'password_confirm': 'StrongPass123',
            },
            format='json',
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', register_response.data)

        login_response = self.client.post(
            '/accounts/login/',
            {'email': 'newcandidate@example.com', 'password': 'StrongPass123'},
            format='json',
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertEqual(login_response.data['email'], 'newcandidate@example.com')
        self.assertEqual(login_response.data['role'], 'candidat')

        profile_response = self.client.get('/accounts/profile/')
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertTrue(profile_response.data['authenticated'])
        self.assertEqual(profile_response.data['user']['email'], 'newcandidate@example.com')

    def test_minimal_recruitment_workflow(self):
        self.client.force_authenticate(user=self.rh)
        offer_response = self.client.post(
            '/offres/',
            {
                'titre': 'Developpeur Django',
                'description': 'Backend Django simple',
                'competences_requises': 'django, python, rest',
                'experience_demandee': 1,
                'type_contrat': 'CDI',
                'salaire_estime': '12000.00',
                'statut': 'ouverte',
            },
            format='json',
        )
        self.assertEqual(offer_response.status_code, status.HTTP_201_CREATED)
        offer_id = offer_response.data['id']

        public_list_response = self.client.get('/offres/')
        self.assertEqual(public_list_response.status_code, status.HTTP_200_OK)
        self.assertTrue(any(item['id'] == offer_id for item in public_list_response.data['results']))

        self.client.force_authenticate(user=self.candidat)
        cv_content = self.build_cv_pdf(
            [
                'Candidate User',
                'candidate@example.com',
                '+212 600 11 22 33',
                'Experience in django python rest APIs',
            ]
        )
        cv_file = SimpleUploadedFile('cv.pdf', cv_content, content_type='application/pdf')
        application_response = self.client.post(
            '/candidatures/',
            {
                'offre': offer_id,
                'cv_file': cv_file,
                'lettre_motivation': 'Experience django python rest',
            },
            format='multipart',
        )
        self.assertEqual(application_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(application_response.data['statut'], 'en_attente')
        self.assertEqual(application_response.data['matching_score'], 100)
        self.assertIn('3 competence', application_response.data['ai_summary'])
        self.assertEqual(application_response.data['ai_extracted_data']['email'], 'candidate@example.com')
        self.assertIn('django', application_response.data['ai_extracted_data']['competences_detectees'])
        application_id = application_response.data['id']

        self.client.force_authenticate(user=self.rh)
        update_application_response = self.client.patch(
            f'/candidatures/{application_id}/',
            {'statut': 'preselectionne'},
            format='json',
        )
        self.assertEqual(update_application_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_application_response.data['statut'], 'preselectionne')

        interview_response = self.client.post(
            '/entretiens/',
            {
                'candidature': application_id,
                'date_heure': (timezone.now() + timedelta(days=1)).isoformat(),
                'statut': 'planifie',
                'notes': 'Premier entretien',
            },
            format='json',
        )
        self.assertEqual(interview_response.status_code, status.HTTP_201_CREATED)
        interview_id = interview_response.data['id']

        evaluation_response = self.client.patch(
            f'/entretiens/{interview_id}/',
            {
                'statut': 'termine',
                'commentaires': 'Bon potentiel',
                'recommandation': 'A retenir',
                'score_communication': 80,
                'score_competences': 85,
                'score_motivation': 90,
                'score_global': 85,
            },
            format='json',
        )
        self.assertEqual(evaluation_response.status_code, status.HTTP_200_OK)
        self.assertEqual(evaluation_response.data['statut'], 'termine')
        self.assertEqual(evaluation_response.data['score_global'], 85)

        stats_response = self.client.get('/statistiques/stats/')
        self.assertEqual(stats_response.status_code, status.HTTP_200_OK)
        self.assertEqual(stats_response.data['total_offres'], 1)
        self.assertEqual(stats_response.data['total_candidatures'], 1)
        self.assertEqual(stats_response.data['entretiens_termines'], 1)

        self.assertEqual(Offre.objects.count(), 1)
        self.assertEqual(Candidature.objects.count(), 1)
        self.assertEqual(Entretien.objects.count(), 1)
