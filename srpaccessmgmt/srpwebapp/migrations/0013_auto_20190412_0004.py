# Generated by Django 2.1.5 on 2019-04-12 05:04

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('srpwebapp', '0012_auto_20190412_0002'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='uploaded_image',
            name='uploader_name',
        ),
        migrations.AddField(
            model_name='uploaded_image',
            name='uploader',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
