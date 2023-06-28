from django.urls import path
from . import views

urlpatterns =[
    path('', views.home, name='home'),
    path('register', views.register, name='register'),
    path('documentation', views.documentation, name='documentation'),
    path('login', views.login, name='login'),
    path('dashboard', views.dashboard, name='dashboard'),
    path('findpoll', views.findpoll, name='findpoll'),
    path('publish', views.publish, name='publish'),
    path('regpoll/<str:pollcode>/<str:pk>/', views.registerPoll, name='registerpoll'),
    path('getpoll/<str:pollcode>/<str:pk>/', views.getpoll, name='getpoll'),
    path('savevalue', views.saveValue, name='savevalue'),
    path('viewpoll/<str:pollcode>/', views.viewPoll, name='viewpoll'),
    path('getpollandvalues/<str:pollcode>/', views.getPollAndValues, name='getpollandvalues'),
    path('editpoll', views.editPoll, name='editpoll'),
    path('deletetemp/<str:pollcode>/', views.deleteTemp, name='deletetemp'),
    path('deletepoll/<str:pollcode>/', views.deletePoll, name='deletepoll'),
    path('generatedoc/<str:pollcode>/<str:docname>/<str:numbered>/', views.generateDoc, name='generetedoc'),
    path('sendemail', views.sendEmail, name='sendemail'),
    path('logout', views.logout, name='logout'),
    path('getuservalues', views.getUesrValues, name='getuservalues'),
    path('delentry/<str:entry_id>/', views.deleteEntry, name='deleteentry'),
    path('activate-user/<uidb64>/<token>', views.activate_user, name='activate' ),
    path('resend-activation-email/<str:userId>/', views.resend_activation_email, name='resendactivation'),
    path('request-reset-email', views.RequestResetEmail.as_view(), name='request-reset-email'),
    path('set-new-password/<uidb64>/<token>', views.SetNewPassword.as_view(), name='set-new-password'),

]