from django.contrib import admin
from .models import Profile, Poll, PollValue, Contact

# Register your models here.
admin.site.register(Profile)
admin.site.register(Poll)
admin.site.register(PollValue)
admin.site.register(Contact)


