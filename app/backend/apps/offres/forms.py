"""
Forms for the offres app — Phase 2 Plan 1.
OffreForm handles creation/update with competences via hidden JSON field.
"""

import json
from datetime import date

from django import forms
from django.core.exceptions import ValidationError

from .models import Offre


class OffreForm(forms.ModelForm):
    """Form for creating and updating job offers."""

    # Non-model field: Select2 widget input (comma-separated tags)
    competences_input = forms.CharField(
        required=False,
        widget=forms.TextInput(
            attrs={
                'id': 'id_competences_input',
                'class': 'form-control',
                'placeholder': 'Rechercher ou créer une compétence...',
            }
        ),
        label='Compétences requises',
    )

    class Meta:
        model = Offre
        fields = [
            'titre',
            'description',
            'type_contrat',
            'salaire_min',
            'salaire_max',
            'date_cloture',
        ]
        widgets = {
            'description': forms.Textarea(attrs={'rows': 6, 'class': 'form-control'}),
            'date_cloture': forms.DateInput(attrs={'type': 'date', 'class': 'form-control'}),
            'titre': forms.TextInput(attrs={'class': 'form-control'}),
            'type_contrat': forms.Select(attrs={'class': 'form-select'}),
            'salaire_min': forms.NumberInput(attrs={'class': 'form-control', 'step': '100'}),
            'salaire_max': forms.NumberInput(attrs={'class': 'form-control', 'step': '100'}),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Pre-fill competences_input from existing instance
        if self.instance and self.instance.pk:
            competences = self.instance.competences or []
            if competences:
                self.fields['competences_input'].initial = json.dumps(competences)

    def clean(self):
        cleaned_data = super().clean()
        salaire_min = cleaned_data.get('salaire_min')
        salaire_max = cleaned_data.get('salaire_max')
        date_cloture = cleaned_data.get('date_cloture')

        if salaire_min and salaire_max and salaire_min > salaire_max:
            raise ValidationError('salaire_min doit être inférieur ou égal à salaire_max.')

        if date_cloture and date_cloture <= date.today():
            raise ValidationError('La date de clôture doit être une date future.')

        return cleaned_data

    def get_competences_list(self):
        """Parse competences from the hidden JSON input or comma-separated text."""
        raw = self.cleaned_data.get('competences_input', '')
        if not raw:
            return []
        raw = raw.strip()
        # Try JSON array first (set by Select2 JS)
        if raw.startswith('['):
            try:
                data = json.loads(raw)
                # data may be list of strings or list of {id, text} dicts
                result = []
                for item in data:
                    if isinstance(item, dict):
                        result.append(item.get('text', item.get('id', '')))
                    else:
                        result.append(str(item))
                cleaned = []
                for c in result:
                    if c.strip():
                        cleaned.append(c.strip())
                return cleaned
            except (json.JSONDecodeError, TypeError):
                pass
        # Fallback: comma-separated plain text
        parts = raw.split(',')
        cleaned = []
        for c in parts:
            if c.strip():
                cleaned.append(c.strip())
        return cleaned
