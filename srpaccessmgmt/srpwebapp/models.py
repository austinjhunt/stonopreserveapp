# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.db import models
# Note: customary to use singular noun for table names (i.e. Visit instead of Visits)

# default user table
from django.contrib.auth.models import User


# table to store all visits
class Visit(models.Model):
    scheduled_date = models.DateField()
    scheduled_start_time = models.TimeField()
    scheduled_end_time = models.TimeField()
    user = models.ForeignKey(User,on_delete=models.CASCADE) # which user scheduled it?; on deletion of user, also delete this
    datetime_visit_was_scheduled = models.DateTimeField()


class Gate(models.Model):
    lock_code = models.IntegerField(null=True) # this will most likely be 4 digits
    gate_number = models.IntegerField(null=True) # will most likely be < 3 digits


class Announcement(models.Model):
    datetime_created = models.DateTimeField() # when was it made?
    user = models.ForeignKey(User,on_delete=models.CASCADE) #who made it?
    announcement = models.TextField() # what is the announcement?
    title = models.CharField(max_length=50,default='')
    date_created=models.DateField(null=True)
    time_created=models.DateField(null=True)

# model to extend User model, keep track of whether each user is on property with toggle var
class User_On_Property(models.Model):
    user = models.OneToOneField(User,on_delete=models.CASCADE)
    on_site = models.BooleanField(default=False)
    latitude = models.FloatField(default=0)
    longitude = models.FloatField(default=0)

# model to store uploaded image filenames, the name of the uploader, and the datetime of upload
class Uploaded_Image(models.Model):
    uploader = models.ForeignKey(User,on_delete=models.CASCADE, null=True)
    upload_datetime = models.DateTimeField()
    img_path = models.CharField(max_length=60)
    caption = models.TextField(default='')