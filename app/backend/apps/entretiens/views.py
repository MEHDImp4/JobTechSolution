from rest_framework import permissions, status, viewsets
from rest_framework.response import Response

from apps.accounts.models import User

from .models import Entretien
from .serializers import EntretienSerializer

STAFF_ROLES = {User.ROLE_ADMIN, User.ROLE_RH, User.ROLE_RECRUTEUR, User.ROLE_MANAGER}


class EntretienViewSet(viewsets.ModelViewSet):
    queryset = Entretien.objects.select_related('candidature__offre', 'candidature__candidat', 'evaluateur').all()
    serializer_class = EntretienSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Un candidat ne voit que ses entretiens.
        user = self.request.user
        queryset = super().get_queryset()
        if user.role in STAFF_ROLES:
            return queryset
        return queryset.filter(candidature__candidat=user)

    def create(self, request, *args, **kwargs):
        # Cree un entretien.
        if request.user.role not in {User.ROLE_ADMIN, User.ROLE_RH, User.ROLE_RECRUTEUR}:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(evaluateur=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        # Met a jour un entretien.
        if request.user.role not in STAFF_ROLES:
            return Response({'detail': 'Acces refuse.'}, status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)
