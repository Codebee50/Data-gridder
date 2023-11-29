from django.urls import path
from . import views

urlpatterns = [
    path('register', views.register, name='register'),
    path('login', views.login, name='login'),
    path('logout', views.logout, name='logout'),
    path('activate-user/<uidb64>/<token>', views.activate_user, name='activate' ),
    path('resend-activation-email/<str:userId>/', views.resend_activation_email, name='resendactivation'),
    path('request-reset-email', views.RequestResetEmail.as_view(), name='request-reset-email'),
    path('set-new-password/<uidb64>/<token>', views.SetNewPassword.as_view(), name='set-new-password'),
    path('getuservalues', views.getUesrValues, name='getuservalues'),
    path('google-login/', views.googleLogIn, name='googlelogin'),
]