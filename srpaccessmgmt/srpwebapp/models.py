# -*- coding: utf-8 -*-
from __future__ import unicode_literals

<<<<<<< HEAD

class User(models.Model):
    user_email = models.CharField(max_length=50)


class LockCode(models.Model):
    current_code = models.CharField(max_length=4)


class Visit(models.Model):
    date = ''
