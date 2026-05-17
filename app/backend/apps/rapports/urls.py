from django.urls import path

from .views import ExportExcelView, ExportPdfView, StatsView

urlpatterns = [
    path('stats/', StatsView.as_view()),
    path('export/pdf/', ExportPdfView.as_view()),
    path('export/excel/', ExportExcelView.as_view()),
]
