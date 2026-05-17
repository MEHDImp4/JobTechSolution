from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'nom',
            'prenom',
            'telephone',
            'adresse',
            'date_naissance',
            'role',
            'is_active',
        ]
        read_only_fields = ['id', 'role', 'is_active']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'nom',
            'prenom',
            'telephone',
            'adresse',
            'date_naissance',
            'password',
            'password_confirm',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Les mots de passe ne correspondent pas.'})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.role = User.ROLE_CANDIDAT
        user.set_password(password)
        user.save()
        return user


class UserAdminSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'nom',
            'prenom',
            'telephone',
            'adresse',
            'date_naissance',
            'role',
            'is_active',
            'is_staff',
        ]
