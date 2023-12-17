from django.urls import path
from . import views

urlpatterns =[
    path('', views.home, name='home'),
    path('documentation', views.documentation, name='documentation'),
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
    path('generatedoc/<str:pollcode>/<str:docname>/<str:numbered>/<str:alph>/<str:factor>/<str:transverse>/', views.generateDoc, name='generetedoc'),
    path('sendemail', views.sendEmail, name='sendemail'),
    path('delentry/<str:entry_id>/', views.deleteEntry, name='deleteentry'),
    path('show-current-site', views.showCurrentSite, name='showcurrentsite'),
    path('contact-datagridder', views.contactUs, name='contact-datagridder'),
    path('getuserpolls/', views.getuserpolls, name='getuserpolls')
]