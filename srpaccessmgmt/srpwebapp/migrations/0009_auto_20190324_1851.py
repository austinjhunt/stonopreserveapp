# Generated by Django 2.1.5 on 2019-03-24 23:51

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('srpwebapp', '0008_auto_20190313_1103'),
    ]

    operations = [
        migrations.RenameField(
            model_name='user_on_property',
            old_name='User',
            new_name='user',
        ),
    ]