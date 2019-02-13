from django.db import models


class User(models.Model):
    user_email = models.CharField(max_length=50)


class LockCode(models.Model):
    current_code = models.CharField(max_length=4)
    