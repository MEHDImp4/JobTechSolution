import random
from datetime import timedelta

from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.accounts.models import User
from apps.candidatures.models import Candidature
from apps.entretiens.models import Entretien
from apps.offres.models import Competence, Offre


class Command(BaseCommand):
    help = 'Seeds the database with test data for JobTech Solutions'

    def handle(self, *args, **options):
        self.stdout.write(self.style.MIGRATE_LABEL('Starting data seeding...'))

        # 1. Create Users
        users_data = [
            {
                'email': 'admin@jobtech.com',
                'nom': 'Alami',
                'prenom': 'Ahmed',
                'role': 'admin',
                'is_staff': True,
                'is_superuser': True,
            },
            {
                'email': 'rh@jobtech.com',
                'nom': 'Bennani',
                'prenom': 'Sara',
                'role': 'rh',
                'is_staff': True,
            },
            {
                'email': 'recruteur@jobtech.com',
                'nom': 'Mansouri',
                'prenom': 'Driss',
                'role': 'recruteur',
            },
            {'email': 'candidat@jobtech.com', 'nom': 'Tazi', 'prenom': 'Mehdi', 'role': 'candidat'},
        ]

        created_users = {}
        for u_data in users_data:
            email = u_data.pop('email')
            user, created = User.objects.get_or_create(
                email=email,
                defaults={
                    **u_data,
                    'is_active': True,
                    'is_email_verified': True,
                },
            )
            if created:
                user.set_password('password123')
                user.save()
                self.stdout.write(f'Created user: {email} ({user.role})')
            else:
                # Force activation for existing test users
                user.is_active = True
                user.is_email_verified = True
                for key, value in u_data.items():
                    setattr(user, key, value)
                user.set_password('password123')
                user.save()
                self.stdout.write(f'Updated and activated existing user: {email}')
            created_users[user.role] = user

        # 2. Create Competences
        skills = [
            ('React', 'framework'),
            ('Django', 'framework'),
            ('Python', 'langage'),
            ('IA / Machine Learning', 'outil'),
            ('PostgreSQL', 'outil'),
            ('TypeScript', 'langage'),
            ('Docker', 'outil'),
            ('Agile', 'soft_skill'),
        ]

        competence_objs = []
        for nom, cat in skills:
            comp, _ = Competence.objects.get_or_create(nom=nom, defaults={'categorie': cat})
            competence_objs.append(comp)

        # 3. Create Job Offers
        offres_data = [
            {
                'titre': 'Développeur FullStack Senior',
                'type': 'CDI',
                'desc': 'Nous recherchons un expert React/Django pour piloter nos projets innovants.',
            },
            {
                'titre': 'Data Scientist IA',
                'type': 'CDI',
                'desc': 'Rejoignez notre équipe IA pour transformer le recrutement grâce au Machine Learning.',
            },
            {
                'titre': 'Product Owner',
                'type': 'CDI',
                'desc': "Interface clé entre les besoins métiers et l'équipe tech.",
            },
            {
                'titre': 'Stage Développeur Frontend',
                'type': 'STAGE',
                'desc': 'Apprenez aux côtés des meilleurs sur React et Tailwind CSS.',
            },
            {
                'titre': 'DevOps Engineer',
                'type': 'FREELANCE',
                'desc': 'Expertise AWS et Docker requise pour optimiser notre infrastructure.',
            },
            {
                'titre': 'Consultant RH Senior',
                'type': 'CDD',
                'desc': 'Accompagnement stratégique sur nos processus de recrutement.',
            },
        ]

        created_offres = []
        rh_user = created_users['rh']

        for o_data in offres_data:
            offre, created = Offre.objects.get_or_create(
                titre=o_data['titre'],
                defaults={
                    'description': o_data['desc'],
                    'type_contrat': o_data['type'],
                    'salaire_min': random.randint(10000, 20000),
                    'salaire_max': random.randint(25000, 50000),
                    'statut': 'publiee',
                    'date_publication': timezone.now() - timedelta(days=random.randint(1, 15)),
                    'created_by': rh_user,
                    'competences': [random.choice(competence_objs).nom for _ in range(3)],
                },
            )
            if created:
                self.stdout.write(f'Created offer: {offre.titre}')
            created_offres.append(offre)

        # 4. Create Candidatures
        candidat_user = created_users['candidat']
        mock_cv = ContentFile(b'%PDF-1.4\n% Mock PDF file for testing', name='cv_test.pdf')

        for i, offre in enumerate(created_offres[:4]):  # Candidate apply to first 4 offers
            status_choices = ['recue', 'analyse_ia', 'examen_rh', 'entretien', 'retenu', 'refuse']
            statut = status_choices[i % len(status_choices)]

            candidature, created = Candidature.objects.get_or_create(
                offre=offre,
                candidat=candidat_user,
                defaults={
                    'cv_file': mock_cv,
                    'lettre_motivation': f'Passionné par le poste de {offre.titre}, je souhaite rejoindre JobTech Solutions.',
                    'experience_annees': random.randint(1, 10),
                    'statut': statut,
                    'score_ia': random.uniform(60.0, 95.0),
                    'ia_status': 'done',
                },
            )
            if created:
                self.stdout.write(f'Created candidature: {candidat_user.email} -> {offre.titre}')

            # 5. Create Interviews for some candidatures
            if statut == 'entretien':
                Entretien.objects.get_or_create(
                    candidat=candidat_user,
                    recruteur=created_users['recruteur'],
                    candidature=candidature,
                    defaults={
                        'date_heure': timezone.now()
                        + timedelta(days=2, hours=random.randint(9, 16)),
                        'type_entretien': 'technique',
                        'statut': 'planifie',
                        'notes': "Vérifier les compétences React et l'appétance pour l'IA.",
                        'created_by': rh_user,
                    },
                )

        self.stdout.write(self.style.SUCCESS('\nDatabase successfully seeded with test data!'))
