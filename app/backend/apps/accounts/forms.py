import re

from django import forms
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

User = get_user_model()
_RE_UPPERCASE = re.compile(r'[A-Z]')
_RE_DIGIT = re.compile(r'\d')
_RE_SPECIAL = re.compile(r'[!@#$%^&*(),.?":{}|<>\-_+=\[\]\\;\'`~/]')


class RegisterForm(forms.Form):
    email = forms.EmailField(
        label='Adresse e-mail',
        max_length=254,
        widget=forms.EmailInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'vous@exemple.com',
                'autocomplete': 'email',
            }
        ),
    )
    nom = forms.CharField(
        label='Nom',
        max_length=100,
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Votre nom',
                'autocomplete': 'family-name',
            }
        ),
    )
    prenom = forms.CharField(
        label='Prénom',
        max_length=100,
        widget=forms.TextInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Votre prénom',
                'autocomplete': 'given-name',
            }
        ),
    )
    password1 = forms.CharField(
        label='Mot de passe',
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Choisissez un mot de passe',
                'id': 'id_password1',
                'autocomplete': 'new-password',
            }
        ),
    )
    password2 = forms.CharField(
        label='Confirmer le mot de passe',
        widget=forms.PasswordInput(
            attrs={
                'class': 'form-control',
                'placeholder': 'Répétez le mot de passe',
                'id': 'id_password2',
                'autocomplete': 'new-password',
            }
        ),
    )

    def clean_email(self):
        email = self.cleaned_data.get('email', '').strip().lower()
        if User.objects.filter(email=email).exists():
            raise ValidationError(
                'Cette adresse e-mail est déjà utilisée. '
                'Veuillez en choisir une autre ou vous connecter.'
            )
        return email

    def clean_nom(self):
        return self.cleaned_data.get('nom', '').strip()

    def clean_prenom(self):
        return self.cleaned_data.get('prenom', '').strip()

    def clean_password1(self):
        password = self.cleaned_data.get('password1', '')
        errors = []

        if len(password) < 8:
            errors.append('Le mot de passe doit contenir au moins 8 caractères.')
        if not _RE_UPPERCASE.search(password):
            errors.append('Le mot de passe doit contenir au moins une lettre majuscule.')
        if not _RE_DIGIT.search(password):
            errors.append('Le mot de passe doit contenir au moins un chiffre.')
        if not _RE_SPECIAL.search(password):
            errors.append('Le mot de passe doit contenir au moins un caractère spécial (!@#$%…).')

        if errors:
            raise ValidationError(errors)

        return password

    def clean(self):
        cleaned_data = super().clean()
        password1 = cleaned_data.get('password1')
        password2 = cleaned_data.get('password2')

        if password1 and password2 and password1 != password2:
            self.add_error('password2', 'Les deux mots de passe ne correspondent pas.')

        return cleaned_data

    def save(self):
        email = self.cleaned_data['email']
        nom = self.cleaned_data['nom']
        prenom = self.cleaned_data['prenom']
        password = self.cleaned_data['password1']

        user = User.objects.create_user(
            email=email,
            nom=nom,
            prenom=prenom,
            password=password,
        )
        return user
