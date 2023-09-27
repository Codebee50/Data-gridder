"""
Django settings for Gridder project.

Generated by 'django-admin startproject' using Django 4.2.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

from pathlib import Path
import os
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-p^k^e4%%@68*o3d(l*)nvg334b9yz5v^6-ea7_og0*-tpy94(6'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True


if DEBUG:
    ALLOWED_HOSTS = ['0.0.0.0', '127.0.0.1', '192.168.0.105', '192.168.0.100', '*']
    # ALLOWED_HOSTS = ['*']

else:
    ALLOWED_HOSTS = ['datagridder.com', 'www.datagridder.com']


# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'data_gridder',
    'filemanager',
    'compressor',  
    # 'sass_processor',
    # 'django_cron',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# CRON_CLASSES = [
#     "data_gridder.templife.TempCron",
# ]

ROOT_URLCONF = 'Gridder.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR/'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Gridder.wsgi.application'


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases


if DEBUG:
    DATABASES = {    
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': 'data_gridder',
            'USER' : 'postgres',
            'PASSWORD': 'beepost',
            'HOST': 'localhost'
        }
    }
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.mysql',
            'NAME': 'datazzcu_gridderdb',
            'USER' : 'datazzcu_beeadmin',
            'PASSWORD': 'beepassword',
            'HOST': 'localhost',
            'PORT': '3306',
            
        }
    }


# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

# STATIC_URL = '/static/'
# STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# STATICFILES_DIRS = (os.path.join(BASE_DIR, 'static'),)


STATIC_URL = '/static/'
if DEBUG:
    STATIC_ROOT = os.path.join(BASE_DIR, 'static')
else:
    STATIC_ROOT = '../public_html/static/'
# STATICFILES_DIRS = (os.path.join(BASE_DIR, 'static'),)


# COMPRESS_PRECOMPILERS =(
#     ('text/x-scss', 'django_libsass.SassCompiler'),
# )

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
    'sass_processor.finders.CssFinder',
)
    
SASS_PROCESSOR_ENABLED = True

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

if DEBUG:
    MEDIA_URL = '/media/'
    MEDIA_ROOT = os.path.join(BASE_DIR, 'media') 
    TEMP_DIR = 'media/temps/'
else:
    MEDIA_URL = '../media/'
    MEDIA_ROOT = '../media/'
    TEMP_DIR = '../media/temps/'

AUTHENTICATION_BACKENDS = [
    'data_gridder.mauth.EmailBackend',
    'django.contrib.auth.backends.ModelBackend']


if DEBUG:
    EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
    EMAIL_HOST = 'smtp.gmail.com'
    EMAIL_PORT = 587
    EMAIL_USE_TLS = True
    EMAIL_HOST_USER = 'codebee286@gmail.com'
    EMAIL_HOST_PASSWORD = 'sssvsyicmhkyzskg'
    EMAIL_FROM_USER = 'codebee286@gmail.com'
    DEFAULT_FROM_EMAIL = EMAIL_HOST_USER
else:
    EMAIL_BACKEND = 'django_smtp_ssl.SSLEmailBackend'
    EMAIL_HOST = 'smtp.zoho.com'
    EMAIL_PORT = 465
    EMAIL_USE_TLS= True
    EMAIL_HOST_USER = 'contact@datagridder.com'
    EMAIL_HOST_PASSWORD = 'pWLMZ6tz3BSW'
    DEFAULT_FROM_EMAIL = EMAIL_HOST_USER







