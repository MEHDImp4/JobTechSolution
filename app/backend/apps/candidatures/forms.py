"""
Candidatures forms — Phase 3 Plan 1.
Three-step wizard forms for the application submission process.
"""

from django import forms
from django.core.validators import RegexValidator

from apps.offres.models import Offre

from .validators import validate_cv_file


class Step1Form(forms.Form):
    """Step 1: Choose a published job offer."""

    offre = forms.ModelChoiceField(
        queryset=Offre.objects.filter(statut='publiee'),
        label="Offre d'emploi",
        empty_label='-- Sélectionnez une offre --',
        widget=forms.Select(attrs={'class': 'form-select'}),
    )

    def __init__(self, *args, **kwargs):
        self._user = kwargs.pop('user', None)
        super().__init__(*args, **kwargs)

    def clean_offre(self):
        offre = self.cleaned_data.get('offre')
        if offre and self._user:
            from apps.candidatures.models import Candidature

            if Candidature.objects.filter(offre=offre, candidat=self._user).exists():
                raise forms.ValidationError('Vous avez déjà postulé à cette offre.')
        return offre


class Step2Form(forms.Form):
    """Step 2: Candidate profile details."""

    telephone = forms.CharField(
        max_length=20,
        label='Téléphone',
        validators=[RegexValidator(r'^\+?[\d\s]{8,15}$', 'Numéro de téléphone invalide.')],
        widget=forms.TextInput(
            attrs={'class': 'form-control', 'placeholder': '+212 6 XX XX XX XX'}
        ),
    )
    linkedin_url = forms.URLField(
        required=False,
        label='Profil LinkedIn',
        widget=forms.URLInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'https://linkedin.com/in/...',
            }
        ),
    )
    experience_annees = forms.IntegerField(
        min_value=0,
        max_value=50,
        label="Années d'expérience",
        widget=forms.NumberInput(attrs={'class': 'form-control'}),
    )
    niveau_etude = forms.ChoiceField(
        choices=[
            ('bac', 'Bac'),
            ('bac2', 'Bac+2'),
            ('bac3', 'Bac+3'),
            ('licence', 'Licence'),
            ('master', 'Master'),
            ('doctorat', 'Doctorat'),
        ],
        label="Niveau d'études",
        widget=forms.Select(attrs={'class': 'form-select'}),
    )

    def __init__(self, *args, **kwargs):
        kwargs.pop('user', None)
        super().__init__(*args, **kwargs)


class Step3Form(forms.Form):
    """Step 3: CV upload, cover letter, and RGPD consent."""

    cv_file = forms.FileField(
        label='CV (PDF ou DOCX, max 5 Mo)',
        validators=[validate_cv_file],
        widget=forms.ClearableFileInput(attrs={'class': 'form-control', 'accept': '.pdf,.docx'}),
    )
    lettre_motivation = forms.CharField(
        widget=forms.Textarea(attrs={'class': 'form-control', 'rows': 6}),
        required=False,
        max_length=2000,
        label='Lettre de motivation',
        help_text='Optionnelle — 2 000 caractères maximum.',
    )
    consentement_rgpd = forms.BooleanField(
        required=True,
        label=(
            "J'accepte que mes données soient traitées pour cette candidature conformément au RGPD."
        ),
        widget=forms.CheckboxInput(attrs={'class': 'form-check-input'}),
    )

    def __init__(self, *args, **kwargs):
        kwargs.pop('user', None)
        super().__init__(*args, **kwargs)
