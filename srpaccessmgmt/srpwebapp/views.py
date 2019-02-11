from django.shortcuts import render
from django.template import loader
from django.db.models import Q, Count
from django.forms.models import model_to_dict
from django.shortcuts import render
from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.template import RequestContext, loader
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.http import JsonResponse

from math import ceil
from random import *
# Create your views here.

# Create your views here.

# home page, aka "index.html"
@csrf_exempt
def index(request):

    template = loader.get_template('main/index.html')
    context = {
        '': '',
    }
    return HttpResponse(template.render(context, request))

# 404 page
@csrf_exempt
def err404(request):

    template = loader.get_template('main/404.html')
    context = {
        '': '',
    }
    return HttpResponse(template.render(context, request))


# blank page
@csrf_exempt
def blank(request):

    template = loader.get_template('main/blank.html')
    context = {
        '': '',
    }
    return HttpResponse(template.render(context, request))

# charts page
@csrf_exempt
def charts(request):

    template = loader.get_template('main/charts.html')
    context = {
        '': '',
    }
    return HttpResponse(template.render(context, request))


# forgot password page
@csrf_exempt
def forgot_password(request):

    template = loader.get_template('main/forgot-password.html')
    context = {
        '': '',
    }
    return HttpResponse(template.render(context, request))

# login page
@csrf_exempt
def login(request):

    template = loader.get_template('main/login.html')
    context = {
        '': '',
    }
    return HttpResponse(template.render(context, request))

# register page
@csrf_exempt
def register(request):

    template = loader.get_template('main/register.html')
    context = {
        '': '',
    }
    return HttpResponse(template.render(context, request))

# tables page
@csrf_exempt
def tables(request):

    template = loader.get_template('main/tables.html')
    context = {
        '': '',
    }
    return HttpResponse(template.render(context, request))

