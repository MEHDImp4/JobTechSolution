# ViewSet pour les statistiques (lecture seule)
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import KPISnapshot
from .serializers import DashboardStatsSerializer, KPISerializer


class KPIViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = KPISnapshot.objects.all()
    serializer_class = KPISerializer
    permission_classes = [IsAuthenticated]


# Stats pour le dashboard RH
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    from .kpi_calculator import RHKPICalculator

    calc = RHKPICalculator()
    stats = calc.get_dashboard_stats()

    serializer = DashboardStatsSerializer(stats)
    return Response(serializer.data)


# Exporter en CSV
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_csv(request):
    from apps.candidatures.models import Candidature
    from apps.offres.models import Offre

    response = Response(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="stats.csv"'

    stats = f"offres,{Offre.objects.count()}\n"
    stats += f"candidatures,{Candidature.objects.count()}\n"

    return Response(stats)