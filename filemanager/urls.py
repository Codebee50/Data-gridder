from django.urls import path
from . import views

urlpatterns =[
    path('validate-existing-document/', views.validateExistingDocument.as_view(), name='validateexistingdocument')
]