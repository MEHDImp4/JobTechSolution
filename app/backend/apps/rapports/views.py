import io

from django.db.models import Avg, Count
from django.http import HttpResponse
from openpyxl import Workbook
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.models import User
from apps.candidatures.models import Candidature
from apps.entretiens.models import Entretien
from apps.offres.models import Offre

ALLOWED_REPORT_ROLES = {User.ROLE_ADMIN, User.ROLE_RH, User.ROLE_RECRUTEUR, User.ROLE_MANAGER}


def build_stats():
    candidatures_par_statut = {
        item['statut']: item['total']
        for item in Candidature.objects.values('statut').annotate(total=Count('id'))
    }
    moyenne_score = Candidature.objects.aggregate(score=Avg('matching_score'))['score'] or 0
    return {
        'total_offres': Offre.objects.count(),
        'total_candidatures': Candidature.objects.count(),
        'candidatures_par_statut': candidatures_par_statut,
        'entretiens_planifies': Entretien.objects.filter(statut='planifie').count(),
        'entretiens_termines': Entretien.objects.filter(statut='termine').count(),
        'moyenne_scores_candidats': round(moyenne_score, 2),
    }


class StatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ALLOWED_REPORT_ROLES:
            return Response({'detail': 'Acces refuse.'}, status=403)
        return Response(build_stats())


class ExportPdfView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ALLOWED_REPORT_ROLES:
            return Response({'detail': 'Acces refuse.'}, status=403)

        stats = build_stats()
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=A4)
        pdf.setTitle('Rapport JobTech Solutions')
        y = 800
        pdf.drawString(50, y, 'Rapport simple JobTech Solutions')
        y -= 40
        for key, value in stats.items():
            pdf.drawString(50, y, f'{key}: {value}')
            y -= 25
        pdf.save()
        buffer.seek(0)
        response = HttpResponse(buffer.read(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename="jobtech-report.pdf"'
        return response


class ExportExcelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role not in ALLOWED_REPORT_ROLES:
            return Response({'detail': 'Acces refuse.'}, status=403)

        stats = build_stats()
        workbook = Workbook()
        sheet = workbook.active
        sheet.title = 'Statistiques'
        sheet.append(['Indicateur', 'Valeur'])
        for key, value in stats.items():
            sheet.append([key, str(value)])

        buffer = io.BytesIO()
        workbook.save(buffer)
        buffer.seek(0)
        response = HttpResponse(
            buffer.read(),
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        )
        response['Content-Disposition'] = 'attachment; filename="jobtech-report.xlsx"'
        return response
