from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone


# Create your models here.

cur_user = get_user_model()
class Profile(models.Model):
    SIGNUP_CHOICES = [
        ('google', 'Google'),
        ('twitter', 'Twitter'),
        ('instagram', 'Instagram'),
        ('facebook', 'Facebook'),
        ('github', 'github'),
        ('email', 'Email')
    ]#defining the valid options for status field
    user = models.ForeignKey(cur_user, on_delete=models.CASCADE)
    id_user = models.IntegerField()
    profileImg = models.ImageField(upload_to= 'profile_images', default='def-user-img.png')
    is_email_verified = models.BooleanField(default=False)
    signup_method = models.CharField(default='email', choices=SIGNUP_CHOICES, max_length=20)

    def __str__(self):
        return self.user.username


class Form(models.Model):
    class Status(models.TextChoices):
        LOCKED = 'LC', 'Locked', 
        OPEN = 'OP', 'Open'

    form_name = models.TextField(blank=False, default='form_name', max_length=65)
    form_code = models.TextField(blank=False, default='form_code')
    form_author = models.TextField(blank=False, default='appended_document')
    form_creator = models.ForeignKey(cur_user, on_delete=models.SET_NULL, null=True, blank=True)
    appended_document = models.FileField(upload_to='documents', default='documents/sampledoc.docx')
    original_doc_name = models.TextField(blank=True, default='document_name')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    fields = models.JSONField()
    description = models.TextField(blank=True, null=True, default=None)
    status = models.CharField(max_length=2, choices=Status.choices, default=Status.OPEN)


    def __str__(self):
        return self.form_name
    
class FormValue(models.Model):
    form_code = models.TextField(blank=False)
    form_name = models.TextField(blank=False, default='none' )
    user_name= models.TextField(blank=False, default='none')
    registered_date = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    field_values = models.JSONField()

    def __str__(self):
        return self.form_code
    
class Contact(models.Model):
    name = models.TextField(blank=False)
    email = models.TextField(blank=False)
    subject = models.TextField(blank=False)
    message = models.TextField(blank=False)

    def __str__(self):
        return self.name
    

