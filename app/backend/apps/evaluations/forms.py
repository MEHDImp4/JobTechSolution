"""
Evaluations forms — Phase 6 Plan 1.
EvaluationForm with 5 star rating fields and commentaire validation.
"""

from django import forms

from .models import Evaluation


class EvaluationForm(forms.ModelForm):
    """Evaluation form with 5 star rating criteria and comment validation."""

    class Meta:
        model = Evaluation
        fields = [
            'competences_rate',
            'communication_rate',
            'motivation_rate',
            'adaptabilite_rate',
            'culture_fit_rate',
            'commentaires',
            'points_forts',
            'points_amelioration',
            'recommandation',
        ]
        widgets = {
            'competences_rate': forms.HiddenInput(
                attrs={'id': 'id_competences_rate', 'min': 1, 'max': 5}
            ),
            'communication_rate': forms.HiddenInput(
                attrs={'id': 'id_communication_rate', 'min': 1, 'max': 5}
            ),
            'motivation_rate': forms.HiddenInput(
                attrs={'id': 'id_motivation_rate', 'min': 1, 'max': 5}
            ),
            'adaptabilite_rate': forms.HiddenInput(
                attrs={'id': 'id_adaptabilite_rate', 'min': 1, 'max': 5}
            ),
            'culture_fit_rate': forms.HiddenInput(
                attrs={'id': 'id_culture_fit_rate', 'min': 1, 'max': 5}
            ),
            'commentaires': forms.Textarea(
                attrs={
                    'rows': 5,
                    'placeholder': 'Commentaires détaillés (minimum 100 caractères)…',
                    'class': 'form-control',
                }
            ),
            'points_forts': forms.Textarea(
                attrs={
                    'rows': 3,
                    'placeholder': 'Points forts du candidat…',
                    'class': 'form-control',
                }
            ),
            'points_amelioration': forms.Textarea(
                attrs={
                    'rows': 3,
                    'placeholder': 'Points à améliorer…',
                    'class': 'form-control',
                }
            ),
            'recommandation': forms.Select(attrs={'class': 'form-select'}),
        }

    def clean_commentaires(self):
        value = self.cleaned_data.get('commentaires', '')
        if len(value) < 100:
            raise forms.ValidationError(
                'Les commentaires doivent contenir au moins 100 caractères '
                f'(actuellement : {len(value)}).'
            )
        return value

    def clean(self):
        cleaned = super().clean()
        # Validate all star ratings are between 1 and 5
        rate_fields = [
            'competences_rate',
            'communication_rate',
            'motivation_rate',
            'adaptabilite_rate',
            'culture_fit_rate',
        ]
        for field in rate_fields:
            val = cleaned.get(field)
            if val is not None and (val < 1 or val > 5):
                self.add_error(field, 'La note doit être comprise entre 1 et 5.')
        return cleaned
