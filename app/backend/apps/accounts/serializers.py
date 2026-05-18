from rest_framework import serializers

from .models import AuditLog, User


class UserSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='telephone', allow_blank=True, required=False)
    get_full_name = serializers.CharField(source='full_name', read_only=True)
    role = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'username',
            'email',
            'nom',
            'prenom',
            'phone',
            'adresse',
            'date_naissance',
            'role',
            'is_active',
            'get_full_name',
            'date_joined',
        ]
        read_only_fields = ['id', 'role', 'is_active', 'get_full_name', 'date_joined']

    def get_role(self, obj):
        return obj.role.lower()


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
            'password',
            'password_confirm',
        ]
        extra_kwargs = {
            'username': {'required': False},
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({'password_confirm': 'Les mots de passe ne correspondent pas.'})
        return attrs

    def create(self, validated_data):
        # On retire les champs utilises uniquement pour la validation du formulaire.
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        # Utilise l'email comme username si non fourni
        if not validated_data.get('username'):
            validated_data['username'] = validated_data['email']
            
        # Creation du candidat avec mot de passe hache (jamais stocke en clair).
        user = User(**validated_data)
        user.role = User.ROLE_CANDIDAT
        user.set_password(password)
        user.save()
        return user


class UserAdminSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        fields = UserSerializer.Meta.fields + ['is_staff']


class UserAdminCreateSerializer(serializers.ModelSerializer):
    phone = serializers.CharField(source='telephone', allow_blank=True, required=False)
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)

    class Meta:
        model = User
        fields = [
            'username',
            'email',
            'nom',
            'prenom',
            'phone',
            'adresse',
            'date_naissance',
            'role',
            'password',
            'is_active',
        ]
        extra_kwargs = {
            'username': {'required': False, 'allow_blank': True},
            'is_active': {'required': False},
        }

    def validate_role(self, value):
        role = value.upper()
        if role not in dict(User.ROLE_CHOICES):
            raise serializers.ValidationError('Role invalide.')
        return role

    def create(self, validated_data):
        # Le mot de passe est extrait pour etre transforme en hash avec set_password.
        password = validated_data.pop('password')
        if not validated_data.get('username'):
            validated_data['username'] = validated_data['email']

        # Creation d'un utilisateur par un profil interne (admin/RH).
        user = User(**validated_data)
        user.set_password(password)
        # Les roles internes recoivent is_staff pour acceder aux ecrans back-office.
        user.is_staff = user.role in {User.ROLE_ADMIN, User.ROLE_RH, User.ROLE_RECRUTEUR}
        user.save()
        return user


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = '__all__'
