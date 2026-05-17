# Serialiseur pour le modele User
from rest_framework import serializers

from .models import AuditLog, User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'nom', 'prenom', 'phone', 'role', 'is_active', 'date_joined']
        read_only_fields = ['id', 'email', 'date_joined']


# Serialiseur pour creer un nouvel utilisateur
class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['email', 'nom', 'prenom', 'password', 'password_confirm']

    def validate_email(self, value):
        return value.strip().lower()

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError(
                {'password_confirm': 'Les mots de passe ne correspondent pas.'}
            )
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


# Serialiseur pour modifier son profil
class ProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['nom', 'prenom', 'phone']


# Serialiseur pour changer de mot de passe
class PasswordChangeSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)
    new_password_confirm = serializers.CharField()

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError(
                {'new_password_confirm': 'Les mots de passe ne correspondent pas.'}
            )
        return data


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source='user.email', read_only=True, allow_null=True)

    class Meta:
        model = AuditLog
        fields = [
            'id',
            'user_email',
            'action',
            'model_name',
            'object_id',
            'ip_address',
            'user_agent',
            'timestamp',
            'endpoint',
        ]
