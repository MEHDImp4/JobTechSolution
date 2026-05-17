from django.core.management.base import BaseCommand

from apps.accounts.models import User
from apps.candidatures.ai import build_simple_ai_result
from apps.candidatures.models import Candidature
from apps.entretiens.models import Entretien
from apps.offres.models import Offre


class Command(BaseCommand):
    help = 'Cree un jeu de donnees minimal pour tester le backend.'

    def handle(self, *args, **options):
        admin, _ = User.objects.get_or_create(
            username='admin',
            defaults={
                'email': 'admin@jobtech.local',
                'nom': 'Admin',
                'prenom': 'JobTech',
                'role': User.ROLE_ADMIN,
                'is_staff': True,
                'is_superuser': True,
            },
        )
        admin.set_password('password123')
        admin.is_staff = True
        admin.is_superuser = True
        admin.role = User.ROLE_ADMIN
        admin.save()

        rh, _ = User.objects.get_or_create(
            username='rh',
            defaults={
                'email': 'rh@jobtech.local',
                'nom': 'RH',
                'prenom': 'JobTech',
                'role': User.ROLE_RH,
                'is_staff': True,
            },
        )
        rh.set_password('password123')
        rh.is_staff = True
        rh.role = User.ROLE_RH
        rh.save()

        candidat, _ = User.objects.get_or_create(
            username='candidat',
            defaults={
                'email': 'candidat@jobtech.local',
                'nom': 'Candidat',
                'prenom': 'Test',
                'role': User.ROLE_CANDIDAT,
            },
        )
        candidat.set_password('password123')
        candidat.role = User.ROLE_CANDIDAT
        candidat.save()

        offre, _ = Offre.objects.get_or_create(
            titre='Developpeur Django Junior',
            defaults={
                'description': 'Participation au developpement backend Django.',
                'competences_requises': 'django, python, rest',
                'experience_demandee': 1,
                'type_contrat': 'CDI',
                'salaire_estime': 12000,
                'statut': 'ouverte',
                'cree_par': rh,
            },
        )

        candidature, _ = Candidature.objects.get_or_create(
            offre=offre,
            candidat=candidat,
            defaults={
                'cv_file': 'cvs/demo.pdf',
                'message': 'Experience django python rest',
                'statut': 'preselectionne',
            },
        )
        ai_result = build_simple_ai_result(offre, message=candidature.message)
        candidature.matching_score = ai_result['score']
        candidature.ai_summary = ai_result['summary']
        candidature.ai_extracted_data = ai_result['extracted_data']
        candidature.save(update_fields=['matching_score', 'ai_summary', 'ai_extracted_data'])

        Entretien.objects.get_or_create(
            candidature=candidature,
            evaluateur=rh,
            defaults={
                'date_heure': '2026-05-20T10:00:00Z',
                'statut': 'planifie',
                'notes': 'Entretien de demonstration',
                'commentaires': 'Profil prometteur',
                'recommandation': 'A retenir',
                'score_communication': 80,
                'score_competences': 85,
                'score_motivation': 90,
                'score_global': 85,
            },
        )

        self.stdout.write(self.style.SUCCESS('Donnees de seed creees ou mises a jour.'))
