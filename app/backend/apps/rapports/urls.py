from django.urls import path

from .views import ExportCsvView, ExportExcelView, ExportPdfView, KPIView, StatsView

urlpatterns = [
    path('stats/', StatsView.as_view()),
    path('rh/', StatsView.as_view()),
    path('kpi/', KPIView.as_view()),
    path('export-csv/', ExportCsvView.as_view()),
    path('export/pdf/', ExportPdfView.as_view()),
    path('export/excel/', ExportExcelView.as_view()),
]
