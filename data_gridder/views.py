from django.shortcuts import render, redirect
from .models import Profile, Poll, PollValue,Contact
from django.contrib.auth.models import User
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, FileResponse
import os
import json
from django.core.serializers import serialize
from docx import Document
import shutil
from django.core.mail import send_mail
from django.conf import settings
from . import forms
from django.template.loader import render_to_string
from django.contrib.sites.shortcuts import get_current_site
from functools import partial
from django.core.exceptions import ObjectDoesNotExist


# Create your views here.
# @login_required(login_url='register')
def home(request):
    if request.user.is_authenticated:
        #this means that the user is logged in 
        user_object = User.objects.get(id= request.user.id)
        user_profile = Profile.objects.get(user=user_object)

        # current_user = request.user.username
        contact_form = forms.ContactForm()
        context= {
            'user_exists': 'true',
            'user_profile' : user_profile,
            'contact_form': contact_form,
        }
        return render(request, 'index.html', context)
    else:
        #this means that the user is not logged in 
        contact_form = forms.ContactForm()
        context = {
            'user_exists': 'false',
            'contact_form': contact_form,
        }
        return render(request, 'index.html', context)

#This is used to pass in the nessesary requirements for displaying the dashboard screen        
@login_required(login_url='login')
def dashboard(request):
    try:
        user_object = User.objects.get(id= request.user.id)
        user_profile = Profile.objects.get(user=user_object)
    except ObjectDoesNotExist:
        user_object = None
        user_profile = None
    
    current_user = request.user.username

    polls = Poll.objects.filter(poll_author = current_user)
    registered_polls = PollValue.objects.filter(user_name = current_user)
    contact_form = forms.ContactForm()
    try:
        poll_values_list = list(polls.values())
        registered_poll_list = list(registered_polls.values())
    except Exception as e:
        print(e)
        poll_values_list = None
        registered_poll_list = None

    

    context= {
        'user_profile' : user_profile,
        'polls': poll_values_list,
        'registered_polls': registered_poll_list,
        'contact_form': contact_form
    }
    return render(request, 'dashboard.html', context)



"""this function checks if the poll exists and if the current user is authenticated 
    and returns json responses with messages matching the corresponding cases"""
def findpoll(request):
    if request.method == 'POST':
        pollcode = request.POST['pollcode']
        if Poll.objects.filter(poll_code=pollcode).exists():
            if request.user.is_authenticated:      
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
                    'message': 'un_auth'
                }
                return JsonResponse(context)
        else:
            context = {
                'status': 'error',
                'message': 'n_f'
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
                print(serialized_values)
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
    
# @login_required(login_url='login')
def registerPoll(request, pollcode, pk):
    #checking if poll exists
    guest = request.GET.get('guest')
    print(guest)
    if Poll.objects.filter(poll_code= pollcode).exists():
        poll = Poll.objects.get(poll_code = pollcode)
        pollname = poll.poll_name
        pollauthor = poll.poll_author
        pollvalues = PollValue.objects.filter(poll_code = pollcode)
        itemcount = pollvalues.count()
        
        context = {
            'stautus' : 'success',
            'statusCode': 200,
            'pollcode': pollcode,
            'pollname': pollname,
            'pollauthor': pollauthor,
            'itemcount': itemcount,
            'value_id': pk,
            'is_authenticated': request.user.is_authenticated,
            'guest': guest, 
            'description': 'Please fill the form below' if poll.description == None else poll.description
        }
        return render(request, 'regpoll.html', context)
    else:
        context = {
            'status': 'failed',
            'statusCode': 401,
            'message': 'Poll ' + pollcode + ' does not exist',
            'pollcode': 'none',
            'pollauthor': 'none',
            'pollname': 'none',
            'itemcount': 0,
            'is_authenticated': request.user.is_authenticated,
            'guest': guest,
            'description': 'Please fill the form below' if poll.description == None else poll.description


        }
        return render(request, 'regpoll.html', context)

""" when a user registers for a poll, this function is used to save the values provided to the database
    also used to save the new values of a pollvalue when user edits the poll values""" 
def saveValue(request):
    if request.method == 'POST':
        pollcode = request.POST.get('pollcode')
        values = request.POST.get('values')
        user = request.user.username
        edit_mode = request.POST.get('editmode')

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
        description = request.POST.get('description')
        description= None if description== '' else description
        pollauthor = request.user.username

        if document is not None:#checking for the correct fie format
            _, fileextension =os.path.splitext(document.name)
            allowed_extensions = ['.doc', '.docx']
            if fileextension not in allowed_extensions:
                context = {
                    'status': 'failed',
                    'message': f'A {fileextension} file format is not allowed'
                }
                return JsonResponse(context)
            
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
                        new_poll = Poll.objects.create(poll_name=pollname, poll_code=pollcode, poll_author=pollauthor, appended_document=document, fields=polldata, original_doc_name = old_file_name, description = description)
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
                            'status': 'failed',
                            'message': 'No DG table was not found in your document please provide a document containing a DG table'
                        }
                    
                else: 
                    new_poll = Poll.objects.create(poll_name=pollname, poll_code=pollcode, poll_author=pollauthor, fields=polldata, description=description)
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
        user = User.objects.get(id = request.user.id)
        username = user.username
        user_initials = ''.join(word[0] for word in username.split()[:2]).upper()
        context = {
            'domain': current_site,
            'user': user,
            'user_initials': user_initials
            
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
        rowcount = len(table.rows)#getting how many rows are in the table
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
    if Poll.objects.filter(poll_code= pollcode).exists():
        poll = Poll.objects.get(poll_code =pollcode)
        

        file_name = 'temp-doc-' + poll.poll_code + '.docx'
        if os.path.exists(file_name):
            os.remove(file_name)
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

        document_path = settings.MEDIA_ROOT +'/documents/doc-' + poll.poll_code + '.docx'
        if os.path.exists(document_path):
            os.remove(document_path)

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
            else:
                context = {
                    'status': 'failed',
                    'message': 'Document does not exist'
                }
                return JsonResponse(context, status=500)
        else:
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
            send_mail(subject, message, sender, ['support@datagridder.com', 'onuhudoudo@gmail.com'],html_message=html,fail_silently=False)
            context = {
                'status': 'success',
                'statusCode': 200,
            }
            return JsonResponse(context, status=200)
        else:
            context = {
                'status': 'failed',
                'statusCode': 400,
            }
            return JsonResponse(context, status=400)

        #redirecting the user to the previous page they were in 
        # return redirect(request.META['HTTP_REFERER']+ '?modal=sent_mail')


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
    if request.user.is_authenticated:
        user_object = User.objects.get(id= request.user.id)
        user_profile = Profile.objects.get(user=user_object)
        context= {
            'user_exists': 'true',
            'user_profile' : user_profile
        }
        return render(request, 'documentation.html', context)
    else:
        context = {
            'user_exists': 'false'
        }
        return render(request, 'documentation.html', context)
        
def showCurrentSite(request):
    current_site = get_current_site(request)
    return redirect('/')

def contactUs(request):
    contact_form = forms.ContactForm()
    context = {
        'contact_form': contact_form
    }
    return render(request,'contactus.html', context)