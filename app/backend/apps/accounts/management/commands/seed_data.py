from django.core.management.base import BaseCommand

from apps.accounts.models import User
from apps.candidatures.models import Candidature
from apps.entretiens.models import Entretien
from apps.offres.models import Offre


class Command(BaseCommand):
    help = 'Cree un jeu de donnees minimal pour tester le backend.'

    def handle(self, *args, **options):
        # Repart d'une base propre pour la partie candidature et entretien.
        Entretien.objects.all().delete()
        Candidature.objects.all().delete()

        admin, _ = User.objects.get_or_create(username='admin')
        admin.email = 'admin@jobtech.com'
        admin.nom = 'Admin'
        admin.prenom = 'JobTech'
        admin.set_password('password123')
        admin.is_staff = True
        admin.is_superuser = True
        admin.role = User.ROLE_ADMIN
        admin.save()

        rh, _ = User.objects.get_or_create(username='rh')
        rh.email = 'rh@jobtech.com'
        rh.nom = 'RH'
        rh.prenom = 'JobTech'
        rh.set_password('password123')
        rh.is_staff = True
        rh.role = User.ROLE_RH
        rh.save()

        recruteur, _ = User.objects.get_or_create(username='recruteur')
        recruteur.email = 'recruteur@jobtech.com'
        recruteur.nom = 'Recruteur'
        recruteur.prenom = 'JobTech'
        recruteur.set_password('password123')
        recruteur.is_staff = True
        recruteur.role = User.ROLE_RECRUTEUR
        recruteur.save()

        candidat, _ = User.objects.get_or_create(username='candidat')
        candidat.email = 'candidat@jobtech.com'
        candidat.nom = 'Candidat'
        candidat.prenom = 'Test'
        candidat.set_password('password123')
        candidat.role = User.ROLE_CANDIDAT
        candidat.save()

        offres = [
            {
                'titre': 'Developpeur Django Junior',
                'description': 'Participation au developpement backend Django et a la maintenance des API.',
                'competences_requises': 'django, python, rest',
                'experience_demandee': 1,
                'type_contrat': 'CDI',
                'salaire_estime': 12000,
            },
            {
                'titre': 'Frontend React Junior',
                'description': 'Creation et integration des interfaces React pour la plateforme de recrutement.',
                'competences_requises': 'react, typescript, css',
                'experience_demandee': 1,
                'type_contrat': 'CDI',
                'salaire_estime': 11000,
            },
            {
                'titre': 'Data Analyst RH',
                'description': 'Analyse simple des candidatures, tableaux de bord et suivi des statistiques RH.',
                'competences_requises': 'excel, sql, reporting',
                'experience_demandee': 2,
                'type_contrat': 'CDD',
                'salaire_estime': 13000,
            },
            {
                'titre': 'Charge de Recrutement',
                'description': 'Gestion des offres, tri des candidatures et planification des entretiens.',
                'competences_requises': 'recrutement, communication, organisation',
                'experience_demandee': 2,
                'type_contrat': 'CDI',
                'salaire_estime': 10000,
            },
            {
                'titre': 'DevOps Junior',
                'description': 'Suivi du deploiement, maintenance des serveurs et support des outils Docker.',
                'competences_requises': 'docker, linux, ci/cd',
                'experience_demandee': 1,
                'type_contrat': 'CDI',
                'salaire_estime': 13500,
            },
            {
                'titre': 'QA Tester',
                'description': 'Verification des fonctionnalites, redaction des cas de test et suivi des anomalies.',
                'competences_requises': 'tests, qualite, documentation',
                'experience_demandee': 1,
                'type_contrat': 'Stage',
                'salaire_estime': 5000,
            },
            {
                'titre': 'Administrateur Systeme',
                'description': 'Gestion des postes, comptes utilisateurs et securite basique du systeme.',
                'competences_requises': 'reseau, windows, support',
                'experience_demandee': 2,
                'type_contrat': 'CDI',
                'salaire_estime': 12500,
            },
            {
                'titre': 'Business Analyst Junior',
                'description': 'Collecte des besoins, suivi des processus et preparation des rapports de synthese.',
                'competences_requises': 'analyse, communication, gestion',
                'experience_demandee': 1,
                'type_contrat': 'CDD',
                'salaire_estime': 11500,
            },
        ]

        for donnees_offre in offres:
            Offre.objects.update_or_create(
                titre=donnees_offre['titre'],
                defaults={
                    'description': donnees_offre['description'],
                    'competences_requises': donnees_offre['competences_requises'],
                    'experience_demandee': donnees_offre['experience_demandee'],
                    'type_contrat': donnees_offre['type_contrat'],
                    'salaire_estime': donnees_offre['salaire_estime'],
                    'statut': 'ouverte',
                    'cree_par': recruteur,
                },
            )

        self.stdout.write(self.style.SUCCESS('Seed termine : offres creees et candidatures supprimees.'))
