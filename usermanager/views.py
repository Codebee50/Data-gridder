from django.shortcuts import render, redirect
from django.contrib import messages
from data_gridder.models import Profile, PollValue
from django.contrib.auth.models import User, auth
from django.contrib.auth.decorators import login_required
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
    print('Accessed the google login function')
    username = request.user.username
    user= User.objects.filter(username=username)
    if user.exists:
        return redirect('/')
    else:
        user = User.objects.create_user(username=username, email=request.user.email, password='google')
        user.save()
        new_profile = Profile.objects.create(user = user, id_user = user.id, signup_method='google')
        new_profile.save()
        return redirect('/')

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
                    return render(request, 'login.html', {'userid': user_profile.id_user})
            else:
                messages.info(request, 'An error occured')
                return redirect('login')
        else: 
            messages.info(request, 'Invalid credentials')
            return redirect('login')
    else:
        context = {
            'load_next': load_next
        }
        return render(request, 'login.html', context)
    
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

