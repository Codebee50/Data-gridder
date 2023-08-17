from django.shortcuts import render, redirect
from django.contrib import messages
from .models import Profile, Poll, PollValue,Contact
from django.contrib.auth.models import User, auth
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, FileResponse
import os
import json
from django.core.serializers import serialize
from docx import Document
import shutil
from django.core.mail import send_mail, EmailMessage, EmailMultiAlternatives
from django.conf import settings
from . import forms
from django.template.loader import render_to_string
import random
from django.contrib.sites.shortcuts import get_current_site
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.utils.encoding import force_bytes, force_str as force_text, DjangoUnicodeDecodeError
from django.views.generic import View
from validate_email import validate_email
from .utils import generate_token
from django.urls import reverse
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from functools import partial
from django.utils.html import strip_tags


# Create your views here.
@login_required(login_url='register')
def home(request):
    user_object = User.objects.get(username= request.user.username)
    user_profile = Profile.objects.get(user=user_object)

    current_user = request.user.username
    
    polls = Poll.objects.filter(poll_author = current_user)
    contact_form = forms.ContactForm()
    context= {
        'user_profile' : user_profile,
        'polls': list(polls.values()),
        'contact_form': contact_form
    }
    return render(request, 'index.html', context)

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

                # user_login = auth.authenticate(request, username=email, password=password)
                # auth.login(request, user_login)

                user_model = User.objects.get(username=username)
                new_profile = Profile.objects.create(user = user, id_user = user.id)
                new_profile.save()
                send_activation_email(user=new_profile, request=request)
                print('putting signup.html in activation mode')
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
    print('resending activation mail..')
    user = User.objects.get(id=userId)
    if user is not None:
        user_profile = Profile.objects.get(id_user = user.id)
        if user_profile.is_email_verified:
            #messages.add_message(request, messages.SUCCESS, 'Your account is already verified, You can login with your newly created account')

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
            # email =EmailMessage(subject=email_subject, body=email_body, from_email= 'Data gridder <codebee286@gmail.com>',
            #             to=[user_profile.user.email])
            
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


    pass

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

        #messages.add_message(request, messages.SUCCESS, 'Email verified, you can now login', 'userverified')
        # return redirect(reverse('login'))
        return render(request, 'emails/activate-account.html', {
            'user':user
        })
    
    return render(request, 'emails/activate-account.html', {
        'user': user
    })
    
def login(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['password']

        user = auth.authenticate(request, username= email, password=password)
        
        if user is not None:
            user_profile= Profile.objects.get(user = user)
            if user_profile is not None:
                if user_profile.is_email_verified:
                    print('user is verified and good to go')
                    auth.login(request, user)
                    return redirect('/')
                else:
                    
                    messages.info(request, 'Email is not verified, please verify your email', 'vrffailed')
                    #return redirect('login')
                    return render(request, 'login.html', {'userid': user_profile.id_user})
            else:
                messages.info(request, 'An error occured')
                return redirect('login')
        else: 
            messages.info(request, 'Invalid credentials')
            return redirect('login')
    else:
        return render(request, 'login.html')
    

class RequestResetEmail(View):
    def post(self, request):
        email = request.POST['email']
        if not validate_email(email):
            messages.error(request, 'Please enter a valid email')
            return render(request, 'request-reset.html')
        

        user = User.objects.filter(email = email)
       
        if user.exists():
            user_profile = Profile.objects.get(id_user = user[0].id)
            print('got here')
            current_site = get_current_site(request)
            email_subject = '[Datagridder] Reset your password'
            email_body = render_to_string('emails/reset-user-password.html', {
                'user': user_profile,
                'domain': current_site,
                'uid': urlsafe_base64_encode(force_bytes(user_profile.user.id)),
                'token': PasswordResetTokenGenerator().make_token(user[0])
            })

            # email =EmailMessage(subject=email_subject, body=email_body, from_email= 'Data gridder <codebee286@gmail.com>',
            #             to=[user_profile.user.email])
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
                    #messages.success(request, 'Password reset success, you can now login with your new password')
                    #return redirect('login')

                    return render(request, 'set-new-password.html', context)
                else: 
                    messages.error(request, 'Something went wrong-- invalid user id')
                    return render(request, 'set-new-password.html', context)
            except DjangoUnicodeDecodeError as identifier:
                messages.error(request, 'Something went wrong')
                return render(request, 'set-new-password.html', context)

#This is used to pass in the nessesary requirements for displaying the dashboard screen        
@login_required(login_url='login')
def dashboard(request):
    user_object = User.objects.get(username= request.user.username)
    user_profile = Profile.objects.get(user=user_object)

    current_user = request.user.username

    polls = Poll.objects.filter(poll_author = current_user)
    registered_polls = PollValue.objects.filter(user_name = current_user)

    contact_form = forms.ContactForm()
   
    context= {
        'user_profile' : user_profile,
        'polls': list(polls.values()),
        'registered_polls': list(registered_polls.values()),
        'contact_form': contact_form
    }
    return render(request, 'dashboard.html', context)

def findpoll(request):
    if request.method == 'POST':
        pollcode = request.POST['pollcode']
        print(pollcode)

        if Poll.objects.filter(poll_code=pollcode).exists():
            poll = Poll.objects.get(poll_code=pollcode)
            context = {
                'status': 'success',
                'message': 'Poll exists',
                'pollname': poll.poll_name,
                'pollauthor': poll.poll_author,
                'pollcode': poll.poll_code

            }
            return JsonResponse(context)
        else:
            context = {
                'status': 'error',
                'message': 'Poll not found'
            }
            return JsonResponse(context)

    else:
        return render(request, '/')

""" gets the fields of the poll with the provided poll code
     also gets the poll value withe the provided variable pk if user wants to edit his entry
     returns a json response"""
def getpoll(request, pollcode, pk):
    if request.method == 'GET':
        if pk == 'nb':
            poll = Poll.objects.get(poll_code=pollcode)
            json_fields = json.dumps(poll.fields)
            context = {
                'fields': json_fields,
                'values': 'empty'
            }
            return JsonResponse(context)

        else:
            if PollValue.objects.filter(id = pk).exists():
                values = PollValue.objects.get(id = pk)
                poll = Poll.objects.get(poll_code=pollcode)
                json_fields = json.dumps(poll.fields)
                serialized_values = serialize('json', [values])
                context = {
                    'fields': json_fields,
                    'values': serialized_values
                }
                return JsonResponse(context)
               
            else:
                context = {
                    'fields': 'empty',
                    'values':  'empty',
                    'message': 'Poll does not exist'
                }
                return JsonResponse(context)
    else: 
        pass
    
def registerPoll(request, pollcode, pk):
    #checking if poll exists
    if Poll.objects.filter(poll_code= pollcode).exists():
        poll = Poll.objects.get(poll_code = pollcode)
        pollname = poll.poll_name
        pollauthor = poll.poll_author
        pollvalues = PollValue.objects.filter(poll_code = pollcode)
        itemcount = pollvalues.count()
        
        context = {
            'stautus' : 'success',
            'pollcode': pollcode,
            'pollname': pollname,
            'pollauthor': pollauthor,
            'itemcount': itemcount,
            'value_id': pk
        }
        return render(request, 'regpoll.html', context)
    else:
        context = {
            'status': 'failed',
            'message': 'Poll ' + pollcode + ' does not exist',
            'pollcode': 'none',
            'pollauthor': 'none',
            'pollname': 'none',
            'itemcount': 0
        }
        return render(request, 'regpoll.html', context)

""" when a user registers for a poll, this function is used to save the values provided to the database
    also used to save the new values of a pollvalue when user edits the poll values""" 
def saveValue(request):
    if request.method == 'POST':
        pollcode = request.POST['pollcode']
        values = request.POST['values']
        user = request.user.username
        edit_mode = request.POST['editmode']

        if edit_mode== 'true':
            value_id = request.POST['valueid']
            if PollValue.objects.filter(id = value_id).exists():
                poll_value = PollValue.objects.get(id =value_id)
                poll_value.field_values = values
                poll_value.save()
                context= {
                    'status' : 'success',
                    'message': 'Entries modified successfully'
                }
                return JsonResponse(context)
            else:
                context= {
                    'status' : 'failed',
                    'message': 'Value id does not exist'
                }
                return JsonResponse(context)
        else:
            if Poll.objects.filter(poll_code = pollcode).exists():
                poll = Poll.objects.get(poll_code=pollcode)
                poll_value = PollValue.objects.create(poll_code=pollcode, poll_name= poll.poll_name, user_name= user, field_values=values)
                poll_value.save()
                context= {
                    'status' : 'success',
                    'message': 'Registeration successfull'
                }
                return JsonResponse(context)
            else:
                context= {
                    'status' : 'failed',
                    'message': 'Poll code does not exist'
                }
                return JsonResponse(context)

@login_required(login_url= 'login')
def publish(request):
    current_site = get_current_site(request)

    if request.method == 'POST':
        pollname = request.POST.get('poll-name')
        document = request.FILES.get('document')
        pollcode = request.POST.get('poll_code')
        polldata = request.POST.get('poll_data')
        pollauthor = request.user.username
        
        #checking if the poll name already exits
        if Poll.objects.filter(poll_name=pollname).exists():
            context = {
                'status': 'failed',
                'message': 'Poll name already exists'
            }
            return JsonResponse(context)
        else:
            if Poll.objects.filter(poll_code = pollcode).exists():
                context = {
                    'status': 'failed',
                    'message': 'Oops an error occurred, please try again'
                }
            else:
                if document is not None:
                    #checking if a dg table exists in the document
                    dgTable = checkForDgTable(document=document)
                    
                    if dgTable == True:
                        old_file_name = document.name

                        # unique_id = str(uuid.uuid4())

                        _, ext = os.path.splitext(old_file_name)
                        # unique_file_name = f"{unique_id}{ext}"
                
                        document.name = 'doc-' + pollcode + ext
                        new_poll = Poll.objects.create(poll_name=pollname, poll_code=pollcode, poll_author=pollauthor, appended_document=document, fields=polldata, original_doc_name = old_file_name)
                        new_poll.save()
                        
                        
                        context = {
                            'status' : 'success',
                            'pollname': pollname,
                            'pollcode': pollcode,
                            'pollauthor': pollauthor
                        }
                        return JsonResponse(context)
                    else:
                        context = {
                            'status': 'failed',
                            'message': 'No DG table was not found in your document please provide a document containing a DG table'
                        }
                    
                else: 
                    new_poll = Poll.objects.create(poll_name=pollname, poll_code=pollcode, poll_author=pollauthor, fields=polldata)
                    new_poll.save()
                    
                    context = {
                        'status' : 'success',
                        'pollname': pollname,
                        'pollcode': pollcode,
                        'pollauthor': pollauthor,
                        'domain': current_site.domain
                    }
            
                return JsonResponse(context)
    else:
        context = {
            'domain': current_site
        }
        return render(request, 'publish.html', context)
    
#navigates to the viewpoll.html file 
@login_required(login_url='login')
def viewPoll(request, pollcode):
    current_site = get_current_site(request)
    if request.method == 'POST':
        poll = Poll.objects.get(poll_code= pollcode)
        pollValues = PollValue.objects.filter(poll_code=pollcode)

        context = {
            'poll': poll,
            'pollvalues': list(pollValues.values())
             
        }

        return JsonResponse(context)
    else:
        poll = Poll.objects.get(poll_code= pollcode)
        
        pollValues = PollValue.objects.filter(poll_code=pollcode)
        peopleCount = len(pollValues)
        context = {
            'poll': poll,
            'pollvalues': list(pollValues.values()),
            'peoplecount': peopleCount,
            'domain': current_site
        }
        return render(request, 'viewpoll.html', context)
    
@login_required(login_url= 'login')
def getPollAndValues(request, pollcode):
        if request.method == 'GET': 
            poll = Poll.objects.get(poll_code=pollcode)
            
            pollValues = PollValue.objects.filter(poll_code=pollcode)
            serialized_poll = serialize('json', [poll])
           
            context = {
                'poll': serialized_poll,
                'pollvalues': list(pollValues.values())
            }
            
            return JsonResponse(context)
        
def editPoll(request):
    if request.method == 'POST':
        new_name = request.POST.get('pollname')
        new_document = request.FILES.get('document')
        pollcode = request.POST.get('pollcode')

        #checking if the poll with the provided poll code exists
        if Poll.objects.filter(poll_code= pollcode).exists():
            poll = Poll.objects.get(poll_code= pollcode)
       
            if new_document is not None:
                #this means the user selected a document
                #chechking for a dg table in the new document provided 
                dgTable = checkForDgTable(new_document)
                if dgTable == True:
                    original_file_name = new_document.name
                    new_document.name = poll.appended_document.name
                    
                    old_doucument_path = poll.appended_document.path

                    #deleting the old document before saving the new one 
                    if poll.appended_document.name == 'sampledoc.docx':
                        pass
                    else:
                        if os.path.exists(old_doucument_path):
                            os.remove(old_doucument_path)
                    poll.appended_document = new_document
                    poll.original_doc_name = original_file_name
                    poll.poll_name = new_name
                    #changing the poll names for every pollvalue object
                    poll_values= PollValue.objects.filter(poll_code = poll.poll_code)
                    for poll_value in poll_values:
                        poll_value.poll_name = new_name
                        poll_value.save()
            else:
                #this means user did not select any doument
                poll.poll_name = new_name

                #changing the poll names for every pollvalue object
                poll_values= PollValue.objects.filter(poll_code = poll.poll_code)
                for poll_value in poll_values:
                    poll_value.poll_name = new_name
                    poll_value.save()
              
            poll.save()
            context = {
                'status': 'success',
                'message': 'Poll successfully modified'
            }
            return JsonResponse(context)
        else:
            context= {
                'status': 'failed',
                'message': str(pollcode) + ' not found'
            }

            return JsonResponse(context)
    else:
        pass

#Returns true or false depending on if the provided document contains a dg table or not 
def checkForDgTable(document):
    doc = Document(document)
    dgTable = False
    tables = doc.tables
    for table in tables:
        rowcount = len(table.rows)
        if rowcount> 1:
            pass
        else:
            row = table.rows[0].cells
            if len(row) >1:
                pass
            else:
                cellValue = row[0].text
                if cellValue.lower() == 'dg':
                    dgTable = True
                else:
                    pass
    return dgTable

#deletes temporary files 
def deleteTemp(request, pollcode):
    print('**deleting temporary files..')
    if Poll.objects.filter(poll_code= pollcode).exists():
        poll = Poll.objects.get(poll_code =pollcode)
        

        file_name = 'temp-doc-' + poll.poll_code + '.docx'
        if os.path.exists(file_name):
            os.remove(file_name)
            print('temp doc deleted')
            context = {
                'status' : 'success',
                'message': 'file deleted successfully'
            }
            return JsonResponse(context)
        else:
            context = {
                'status' : 'success',
                'message': 'file deleted successfully'
            }
            return JsonResponse(context)
    else:
        context = {
            'status': 'failed',
             'message': 'Poll not found'
        }

        return JsonResponse(context)
    
#delets poll with provided poll code 
def deletePoll(request, pollcode):
    print('**deleting' , pollcode)

  
    if Poll.objects.filter(poll_code = pollcode).exists():
        poll = Poll.objects.get(poll_code = pollcode)

        #deleting all the pollvalues associated with this pollcode 
        pollvalues = PollValue.objects.filter(poll_code= pollcode)
        if len(pollvalues) > 0:
            for value in pollvalues:
                value.delete()

        temp_doc = settings.TEMP_DIR + 'temp-doc-' + poll.poll_code + '.docx'
        if os.path.exists(temp_doc):
            os.remove(temp_doc)
            print('**deleted poll temporary document..')

        document_path = settings.MEDIA_ROOT +'/documents/doc-' + poll.poll_code + '.docx'
        if os.path.exists(document_path):
            os.remove(document_path)
            print('**deleted poll document')

        poll.delete()
        context = {
            'status': 'success',
             'message': 'Poll deleted'
        }
        return JsonResponse(context)
    else:
        context = {
            'status': 'failed',
             'message': 'Poll not found'
        }
        return JsonResponse(context)
    
#generates a temporary document and downloads it 

def generateDoc(request, pollcode, docname, numbered, alph, factor, transverse):
   temp_dir = settings.TEMP_DIR
   if request.method == 'GET': 
        #checking if poll exists 
        if Poll.objects.filter(poll_code=pollcode).exists:
            poll = Poll.objects.get(poll_code= pollcode)
            pollValues = PollValue.objects.filter(poll_code=pollcode)
            
            is_numbered = {'true': True, 'false': False}.get(numbered.lower())   
            is_alphabetical_ordered = {'true': True, 'false': False}.get(alph.lower())
            

        
            #----------GENERATING A TEMPORARY DOCUMENT---------------
            
            temp_doc = temp_dir + 'temp-doc-' + poll.poll_code + '.docx'

        
            
            with open(temp_doc, 'wb+') as destination:
                with poll.appended_document.open('rb') as source: 
                    shutil.copyfileobj(source, destination)
                

            #getting the number of rows and number of columns required to make a table out of the poll values
            #adding 1 to the length of my poll values for the table to account for the headers
            num_rows = len(list(pollValues.values())) +1
            if is_numbered:
                #adding 1 column to account for the number colomn if list is supposed to be numbered
                num_cols =  len(json.loads(poll.fields)) +1
            else:
                num_cols =  len(json.loads(poll.fields))
           
            
            doc = Document(temp_doc)
            tables = doc.tables
            for table in tables:
                rowcount = len(table.rows)
                if rowcount> 1:
                    pass
                else:
                    row = table.rows[0].cells
                    if len(row) >1:
                        pass
                    else:
                        cellValue = row[0].text
                        if cellValue.lower() == 'dg':
                            #we found a dg table!
                            parent_table = table._element.getparent()
                            new_table = doc.add_table(rows=num_rows, cols=num_cols)
                            new_table.style = 'Table Grid'
                            #inserting our table right below the dg table 
                            parent_table.insert(parent_table.index(table._element) +1, new_table._element)
                            #removing the dg table leavinig only the new one 
                            parent_table.remove(table._element)
                        else:
                            pass
                
            #setting the content of the header cells
            header_cells = new_table.rows[0].cells
            if is_numbered:
                header_cells[0].text = ''
                hIndex = 1
            else:
                 hIndex =0
            for header in json.loads(poll.fields):
                cell = header_cells[hIndex]
                if header.get('name') == '-':
                
                    cell.text = ''
                else:
                    cell.text = header.get('name')

                if cell.text != '':
                    cell.paragraphs[0].runs[0].bold = True
                hIndex +=1

            poll_value_list = list(pollValues.values())
            
            if is_alphabetical_ordered:
                if transverse == 'asc':
                    poll_value_list.sort(key= partial(sort_by_field_values, factor=factor), reverse=False)
                else:
                    poll_value_list.sort(key= partial(sort_by_field_values, factor=factor), reverse=True)


            #setting the other rows of the table 
            #iterate starting from row index 1 to row index num_rows, this is done to exclude the headers
            for i in range(1, num_rows):
                row_cells = new_table.rows[i].cells
                poll_fields = json.loads(poll.fields)
                val = poll_value_list[i-1]
                print(val)
                pIndex = 0
                for index, cell in enumerate(row_cells):
                    if is_numbered:
                        if index == 0:
                            cell.text = str(i)
                        else:
                            field = poll_fields[pIndex]
                            if field.get('datatype') == 'empty':
                                cell.text = ''
                            else:
                                cell.text = field.get('name')
                                for item in json.loads(val.get('field_values')):
                                    if item.get('name') == field.get('name'):
                                        cell.text = item.get('value')
                            pIndex +=1
                    else:
                        field = poll_fields[pIndex]
                        if field.get('datatype') == 'empty':
                            cell.text = ''
                        else:
                            cell.text = field.get('name')
                            for item in json.loads(val.get('field_values')):
                                if item.get('name') == field.get('name'):
                                    cell.text = item.get('value')
                        
                        pIndex +=1

            
            doc.save(temp_doc)

            #-----DOWNLOADING THE GENERATED TEMPORARY DOCUMENT----------
            file_name = temp_dir+ 'temp-doc-' + poll.poll_code + '.docx'
       
            if os.path.exists(file_name):
                file = open(file_name, 'rb')
                
                response = FileResponse(file)
                response['Content-disposition'] ='attachment; filename= "' + docname + '"'
                return response
                #TODO: remember to shedule a task which deletes the temp file 20 mins after
            else:
                print('document does not exist' + pollcode)
                context = {
                    'status': 'failed',
                    'message': 'Document does not exist'
                }
                return JsonResponse(context, status=500)
        else:
            print('poll not found')
            context = {
                'status': 'failed',
                'message': 'Poll not found'
            }
            return JsonResponse(context, status= 500)
        

def sort_by_field_values(item, factor):
    for item in json.loads(item.get('field_values')):
        if item.get('name') == factor:
            return item.get('value')
        
def sendEmail(request):
    if request.method == 'POST':
        
        form = forms.ContactForm(request.POST)
        if form.is_valid():
            email = form.cleaned_data['email']
            name = form.cleaned_data['name']
            subject = form.cleaned_data['subject']
            message = form.cleaned_data['message']
           
            contact = Contact.objects.create(email=email, name= name, subject= subject, message = message)
            contact.save()

            html = render_to_string('emails/contactform.html', {
                'name': name,
                 'email': email,
                 'subject':subject,
                 'message': message
            })

            sender = 'Data gridder <' + str(settings.EMAIL_HOST_USER) + '>' 
            send_mail(subject, message, sender, ['codebee345@outlook.com', 'onuhudoudo@gmail.com'],html_message=html,fail_silently=False)
        else:
            print('form is not valid')

        
        return redirect(request.META['HTTP_REFERER'])

@login_required(login_url='login')
def logout(request):
    auth.logout(request)
    return render(request, 'login.html')

@login_required(login_url='login')
def getUesrValues(request):
    username = request.user.username
    values = PollValue.objects.filter(user_name= username)
    
    context = {
        'status': 'success',
        'user_values': list(values.values())
    }

    return JsonResponse(context)
        
"""this deletes a poll value with the id provided in the url"""
def deleteEntry(request, entry_id):
    entry_id = int(entry_id)
    if PollValue.objects.filter(id= entry_id).exists():
        entry = PollValue.objects.get(id= entry_id)
        entry.delete()
        context = {
            'status': 'success',
            'message': 'Entry deleted successfully'
        }
        return JsonResponse(context)
    else:
        context= {
            'status': 'failed',
            'message': 'Entry does not exist'
        }
        return JsonResponse(context)

def documentation(request):
    user_object = User.objects.get(username= request.user.username)
    user_profile = Profile.objects.get(user=user_object)
    context= {
        'user_profile' : user_profile
    }
    return render(request, 'documentation.html', context)

def showCurrentSite(request):
    current_site = get_current_site(request)
    print('the current site is ', current_site)
    return redirect('/')

def contactUs(request):
    contact_form = forms.ContactForm()
    context = {
        'contact_form': contact_form
    }
    return render(request,'contactus.html', context)