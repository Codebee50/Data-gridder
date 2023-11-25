from django import forms


class ContactForm(forms.Form):
    name = forms.CharField(widget=forms.TextInput(attrs={'class': 'text-input', 'placeholder': 'Name'}))
    email = forms.EmailField(widget=forms.EmailInput(attrs={'class': 'text-input', 'placeholder': 'Email'}))
    subject = forms.CharField(widget=forms.TextInput(attrs={'class': 'text-input', 'placeholder': 'Subject'}))
    message = forms.CharField(widget= forms.Textarea(attrs={'class': 'text-input', 'placeholder': 'Message'}))
