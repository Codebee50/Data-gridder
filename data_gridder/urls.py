from django.urls import path
from . import views

urlpatterns =[
    path('', views.home, name='home'),
    path('documentation', views.documentation, name='documentation'),
    path('dashboard', views.dashboard, name='dashboard'),
    path('findform', views.findform, name='findform'),
    path('publish', views.publish, name='publish'),
    path('regform/<str:formcode>/<str:pk>/', views.registerForm, name='registerform'),
    path('getform/<str:formcode>/<str:pk>/', views.getform, name='getform'),
    path('savevalue', views.saveValue, name='savevalue'),
    path('viewform/<str:formcode>/', views.viewForm, name='viewform'),
    path('getformandvalues/<str:formcode>/', views.getFormAndValues, name='getformandvalues'),
    path('editform', views.editForm, name='editform'),
    path('modifyform', views.modifyForm, name='modifyform'),
    path('deletetemp/<str:formcode>/', views.deleteTemp, name='deletetemp'),
    path('deleteform/<str:formcode>/', views.deleteForm, name='deleteform'),
    path('generatedoc/<str:formcode>/<str:docname>/<str:numbered>/<str:alph>/<str:factor>/<str:transverse>/', views.generateDoc, name='generetedoc'),
    path('sendemail', views.sendEmail, name='sendemail'),
    path('delentry/<str:entry_id>/', views.deleteEntry, name='deleteentry'),
    path('show-current-site', views.showCurrentSite, name='showcurrentsite'),
    path('contact-datagridder', views.contactUs, name='contact-datagridder'),
    path('getuserforms/', views.getuserforms, name='getuserforms')
]