# Generated by Django 2.1.5 on 2019-04-23 20:54

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('srpwebapp', '0014_announcement_title'),
    ]

    operations = [
        migrations.RenameField(
            model_name='announcement',
            old_name='date_created',
            new_name='datetime_created',
        ),
    ]
