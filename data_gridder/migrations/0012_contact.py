# Generated by Django 4.2 on 2023-06-11 06:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('data_gridder', '0011_pollvalue_poll_name'),
    ]

    operations = [
        migrations.CreateModel(
            name='Contact',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField()),
                ('email', models.TextField()),
                ('subject', models.TextField()),
                ('message', models.TextField()),
            ],
        ),
    ]