from django.db import models
from django.contrib.auth import get_user_model


# Create your models here.

cur_user = get_user_model()
class Profile(models.Model):
    user = models.ForeignKey(cur_user, on_delete=models.CASCADE)
    id_user = models.IntegerField()
    profileImg = models.ImageField(upload_to= 'profile_images', default='def-user-img.png')
    is_email_verified = models.BooleanField(default=False)

    def __str__(self):
        return self.user.username


class Poll(models.Model):
    poll_name = models.TextField(blank=False, default='poll_name')
    poll_code = models.TextField(blank=False, default='poll_code')
    poll_author = models.TextField(blank=False, default='appended_document')
    appended_document = models.FileField(upload_to='documents', default='sampledoc.docx')
    original_doc_name = models.TextField(blank=True, default='document_name')
    created_at = models.DateTimeField(auto_now_add=True, blank=True, null=True)
    fields = models.JSONField()
    
    def __str__(self):
        return self.poll_name
    
class PollValue(models.Model):
    poll_code = models.TextField(blank=False)
    poll_name = models.TextField(blank=False, default='none' )
    user_name= models.TextField(blank=False, default='none')
    field_values = models.JSONField()

    def __str__(self):
        return self.poll_code
    
class Contact(models.Model):
    name = models.TextField(blank=False)
    email = models.TextField(blank=False)
    subject = models.TextField(blank=False)
    message = models.TextField(blank=False)

    def __str__(self):
        return self.name
    

