# Generated by Django 2.1.5 on 2019-03-30 14:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('srpwebapp', '0009_auto_20190324_1851'),
    ]

    operations = [
        migrations.AddField(
            model_name='user_on_property',
            name='latitude',
            field=models.FloatField(default=0),
        ),
        migrations.AddField(
            model_name='user_on_property',
            name='longitude',
            field=models.FloatField(default=0),
        ),
    ]
