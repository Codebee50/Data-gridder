from django.shortcuts import render, redirect
from django.contrib import messages
from data_gridder.models import Profile, PollValue
from django.contrib.auth.models import User, auth
from django.contrib.auth.decorators import login_required
from django.contrib.auth import login as auth_login
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str as force_text, DjangoUnicodeDecodeError
from django.views.generic import View
from validate_email import validate_email
from data_gridder.utils import generate_token
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.html import strip_tags
from django.urls import resolve, Resolver404
from django.http import JsonResponse
from google.oauth2 import id_token
from google.auth.transport import requests


def register(request):
    if request.method == 'POST':
        username = request.POST['username']
        email = request.POST['email']
        password = request.POST['password']
        password2 = request.POST['password2']
        
        if password == password2:
            if User.objects.filter(username= username).exists():
                messages.info(request, 'Username is already in use', 'usernameinfo')
                return redirect('register')
            elif User.objects.filter(email = email).exists():
                messages.info(request, 'Email is already in use', 'emailinfo')
                return redirect('register')
            else:
                user = User.objects.create_user(username=username, email=email, password=password)
                user.save()
                new_profile = Profile.objects.create(user = user, id_user = user.id)
                new_profile.save()
                send_activation_email(user=new_profile, request=request)
                #put signup.html in activate email mode 
                return render(request, 'signup.html', {
                     'mode': 'activate_mail',
                     'email': email,
                     'username': username,
                     'userid': user.id
                })
            
        else:
            messages.info(request, 'Password does not match', 'passwordinfo')
            return redirect('register')
            
    else:
        #put signup.html in signup mode 
        return render(request, 'signup.html', {
            'mode': 'signup'
        })

def googleLogIn(request):
    token = request.POST.get('id_token')
    g_email = request.POST.get('email')
    g_username = request.POST.get('username')
    try:
        id_token.verify_oauth2_token(token, requests.Request(), settings.GOOGLE_CLIENT_ID)
        context = {
            "message": "Token verified", 
            "status": 200
        }
        
        user_queryset = User.objects.filter(email=g_email)
        if(user_queryset.exists()):# email already exists in our database we attempt to log the user in 
            user_object = user_queryset.first()
            try:
                user_profile = Profile.objects.get(id_user =user_object.id)
            except Profile.DoesNotExist:
                return JsonResponse({'message': "Fatal: An error occured, please contact your site administrator code-ERR7000",
                                     'status': 500}, status=500)
            
            if user_profile.signup_method == 'google' or user_profile.signup_method == 'email':
                auth_login(request, user_object, backend='django.contrib.auth.backends.ModelBackend')
                
                return JsonResponse({
                    "message": "User logged in succesfully",
                    "status": 200
                }, status=200)
            else:
                context = {
                    'message': f'Seems you chose the {user_profile.signup_method} when you created your account. Please choose {user_profile.signup_method} below to sign in.',
                    'status': 400
                }
                return JsonResponse(context, status=400)
        else:
            #create an account for the user and log them in
            user_created = createUserAccount(request, g_username, g_email, 'google')
            if user_created:
                return JsonResponse({
                    "message": "User logged in succesfully",
                    "status": 200
                }, status=200)
            else:
                return JsonResponse({
                    'message': "Login failed, please try again", 
                    'status': 500
                }, status=500)
    except ValueError as e:#this means token could not be verified hence an invalid login attempt
        print(e)
        context = {
            "message": "Error signing in with google please try again.",
            "status": 400
        }
        return JsonResponse(context, status=400)
    
def createUserAccount(request, username, email, signup_method):
    #creating a new user 
    user = User.objects.create_user(username=username, email=email)
    generated_password = User.objects.make_random_password()#generating a password for the user 
    print('The generated password is ', generated_password)
    user.set_password(generated_password)
    user.save()

    print('user has been saved')
    new_profile = Profile.objects.create(user=user, id_user=user.id)
    new_profile.signup_method = signup_method
    new_profile.is_email_verified = True
    new_profile.save()
    print('profile created and saved')
    #Login in the user just created
    auth_login(request, user, backend='django.contrib.auth.backends.ModelBackend')

    return True

    
def send_activation_email(user, request):
    current_site = get_current_site(request)
    email_subject = 'Activate your account'
    email_body = render_to_string('emails/activate.html', {
        'user': user,
        'domain': current_site,
        'uid': urlsafe_base64_encode(force_bytes(user.user.id)),
        'token': generate_token.make_token(user)
    })
    text_content = strip_tags(email_body)
    # email =EmailMessage(subject=email_subject, body=text_content, from_email= settings.EMAIL_HOST_USER,
    #              to=[user.user.email])
    
    sender = 'Data gridder <' + str(settings.EMAIL_HOST_USER) + '>' 
    email= EmailMultiAlternatives(
        email_subject,
        text_content,
        sender,
        [user.user.email]
    )
    #email.content_subtype = 'html'
    email.attach_alternative(email_body, 'text/html')
    email.send()

def resend_activation_email(request, userId):
    user = User.objects.get(id=userId)
    if user is not None:
        user_profile = Profile.objects.get(id_user = user.id)
        if user_profile.is_email_verified:
            return render(request, 'emails/activate-account.html', {
            'user':user
            })
            
        else:
            current_site = get_current_site(request)
            email_subject = 'Activate your account'
            email_body = render_to_string('emails/activate.html', {
                'user': user_profile,
                'domain': current_site,
                'uid': urlsafe_base64_encode(force_bytes(user_profile.user.id)),
                'token': generate_token.make_token(user_profile)
            })

            text_content = strip_tags(email_body)
            
            sender = 'Data gridder <' + str(settings.EMAIL_HOST_USER) + '>' 
            email = EmailMultiAlternatives(
                email_subject,
                text_content,
                sender,
            )
            email.attach_alternative(email_body, 'text/html')
            email.content_subtype = 'html'
            email.send()
            
            return render(request, 'signup.html', {
                     'mode': 'activate_mail',
                     'email': user_profile.user.email,
                     'username': user_profile.user.username,
                     'userid': user_profile.id_user
                })
    else:
        messages.add_message(request, messages.ERROR, 'An error occured -Invalid user', 'invaliduser')

def activate_user(request, uidb64, token):
    #when we try to decode the uidb64 token, we might get an error
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = Profile.objects.get(id_user = uid)
       
    except Exception as e:
        user = None
    
    if user and generate_token.check_token(user, token):
        user.is_email_verified = True
        user.save()

        return render(request, 'emails/activate-account.html', {
            'user':user
        })
    
    return render(request, 'emails/activate-account.html', {
        'user': user
    })

class RequestResetEmail(View):
    def post(self, request):
        email = request.POST['email']
        if not validate_email(email):
            messages.error(request, 'Please enter a valid email')
            return render(request, 'request-reset.html')
        
        user = User.objects.filter(email = email)
       
        if user.exists():
            user_profile = Profile.objects.get(id_user = user[0].id)
            current_site = get_current_site(request)
            email_subject = '[Datagridder] Reset your password'
            email_body = render_to_string('emails/reset-user-password.html', {
                'user': user_profile,
                'domain': current_site,
                'uid': urlsafe_base64_encode(force_bytes(user_profile.user.id)),
                'token': PasswordResetTokenGenerator().make_token(user[0])
            })

            text_content = strip_tags(email_body)
            sender = 'Data gridder <' + str(settings.EMAIL_HOST_USER) + '>' 
            email = EmailMultiAlternatives(
                email_subject,
                text_content,
                sender,
                [user_profile.user.email] 
            )
            email.attach_alternative(email_body, 'text/html')
            email.content_subtype = 'html'
            email.send()
            messages.success(request, 'We have sent you an email with instructions on how to reset your password', 'emailsent')
            return render(request, 'request-reset.html')
        else:
            messages.success(request, 'We have sent you an email with instructions on how to reset your password', 'emailsent')
            return render(request, 'request-reset.html')
    def get(self, request):
        return render(request, 'request-reset.html')


class SetNewPassword(View):
    def get(self, request, uidb64, token):
        context = {
             'uidb64': uidb64,
             'token': token
        }
        try:
            user_id = force_text(urlsafe_base64_decode(uidb64))
            if User.objects.filter(id = user_id).exists():
                user = User.objects.get(id=user_id)
                if not PasswordResetTokenGenerator().check_token(user, token):
                    #this means the password reset link is invalid
                    messages.info(request, 'Password reset link is expired')
                    context = {
                        'mode': 'invalidresetlink',
                        'message': "The link you're trying to access is either expired or does not exist. This might occur as a result of a previously used link"
                    }
                    return render(request, 'set-new-password.html', context)
            else: 
                messages.error(request, 'Something went wrong-- invalid user id')
                return render(request, 'set-new-password.html', context)
            
        except DjangoUnicodeDecodeError as identifier:
            messages.info(request, 'An unknown error occured')
            context={
                'mode': 'invalidresetlink',
                'message': 'An unknown error occured'

            }
            return render(request, 'set-new-password.html', context)


        return render(request, 'set-new-password.html', context)
    

    def post(self, request, uidb64, token):
        context = {
            'uidb64': uidb64,
            'token': token,
            'mode': 'reset-password'
        }
        password = request.POST['password']
        password2 = request.POST['password2']
        
        if password != password2:
            messages.info(request, 'Password does not match', 'passwordinfo')
            return render(request, 'set-new-password.html', context)
        else:
            #there are no errors, proceed

            try:
                #decode this and give us the user id
                #its returns a byte so we have to turn it to string using force text
                user_id = force_text(urlsafe_base64_decode(uidb64))
                if User.objects.filter(id = user_id).exists():
                    user = User.objects.get(id=user_id)
                    user.set_password(password)
                    user.save()
                    context= {
                        'mode': 'confirmreset'
                    }
                    
                    return render(request, 'set-new-password.html', context)
                else: 
                    messages.error(request, 'Something went wrong-- invalid user id')
                    return render(request, 'set-new-password.html', context)
            except DjangoUnicodeDecodeError as identifier:
                messages.error(request, 'Something went wrong')
                return render(request, 'set-new-password.html', context)
            
def login(request):
    load_next = request.GET.get('load_next', None)
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']

        user = auth.authenticate(request, username= email, password=password)
        if user is not None:
            user_profile= Profile.objects.get(user = user)
            if user_profile is not None:
                if user_profile.is_email_verified:
                    auth.login(request, user)
     
                    if is_project_url(load_next):
                        return redirect(load_next)
                    
                    return redirect('/')
                else:
                    messages.info(request, 'Email is not verified, please verify your email', 'vrffailed')
                    login_context = {
                        'load_next': load_next,
                        'g_client_id': settings.GOOGLE_CLIENT_ID,
                        'userid': user_profile.id_user
                      }
                    return render(request, 'login.html', login_context)
            else:
                messages.info(request, 'An error occured')
                return redirect('login')
        else: 
            messages.info(request, 'Invalid credentials')
            return redirect('login')
    else:
        login_context = {
            'load_next': load_next,
            'g_client_id': settings.GOOGLE_CLIENT_ID,
        }
        return render(request, 'login.html', login_context)
    
@login_required(login_url='login')
def getUesrValues(request):
    username = request.user.username
    values = PollValue.objects.filter(user_name= username)
    
    context = {
        'status': 'success',
        'user_values': list(values.values())
    }

    return JsonResponse(context)


def is_project_url(url):
    try:
        resolve(url)
        return True
    except Resolver404:
        return False
    
@login_required(login_url='login')
def logout(request):
    auth.logout(request)
    return render(request, 'login.html')

