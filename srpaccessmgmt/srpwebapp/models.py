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
    user = models.ForeignKey(User, on_delete=models.CASCADE) # which user scheduled it?; on deletion of user, also delete this


class Code(models.Model):
    pass

