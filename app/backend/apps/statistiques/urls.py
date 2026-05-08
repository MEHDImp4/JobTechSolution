from django.urls import path

from . import views

app_name = 'statistiques'

urlpatterns = [
    path('dashboard/', views.DashboardRHView.as_view(), name='dashboard'),
    path('export-csv/', views.ExportCSVView.as_view(), name='export_csv'),
]
