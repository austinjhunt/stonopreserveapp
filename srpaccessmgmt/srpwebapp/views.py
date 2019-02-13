from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.template import RequestContext, loader
from django.http import HttpResponse, HttpResponseRedirect, Http404

# default user table
from django.contrib.auth.models import User

# import the models
from .models import *
# use this function for returning json data on ajax requests
import json
# for ajax requests, returning JSON to JS
def render_to_json_response(context, **response_kwargs):
    data = json.dumps(context)
    response_kwargs['content_type'] = 'application/json'
    return HttpResponse(data, **response_kwargs)


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

    if request.is_ajax and request.POST.get('btnType') == 'login':
        try:
            result = 'auth fail' # initialize
            user = authenticate(username='john', password='secret')
            if user is not None:
                result = 'auth success'
                login(request, user)
                request.session['user_id'] = str(user.id)
                request.session['user_email'] = user.username
                request.session['full_name'] = user.first_name + ' ' + user.last_name
        except Exception as e:
            print(e)

        data = {'result': result}
        return render_to_json_response(data)

    template = loader.get_template('main/login.html')
    context = {
        '': '',
    }
    return HttpResponse(template.render(context, request))

# register page
@csrf_exempt
def register(request):

    # if user clicks logout on register page
    if request.is_ajax() and request.user.is_authenticated and (request.POST.get('btnType') == 'logout'):
        try:
            logout(request)
            result = 'logout success'
        except Exception as e:
            print(e)
            result = 'logout fail'
        data = {'result': result}
        return render_to_json_response(data)

    # ajax request to handle registering new account
    if request.is_ajax() and request.user.is_authenticated and (request.POST.get('btnType') == 'register_new_account'):
        rp = request.POST
        try:
            is_superuser = 0 if rp.get('accountType') == 'student' else 1

            # only create a new user if there is not already one with this username/email
            alreadyexists = User.objects.filter(username=rp.get('email'))
            if len(alreadyexists) == 0: # does not already exist
                # create a new user instance (default User model from auth app
                newUser = User.objects.create_user(username=rp.get('email'),
                                                   email=rp.get('email'),
                                                   password=rp.get('pass'),
                                                   first_name=rp.get('firstName'),
                                                   last_name=rp.get('lastName'),
                                                   is_superuser=is_superuser,
                                                   is_active=True)
                newUser.save()
                result = 'register success'
        except Exception as e:
            print(e)
            result = 'register fail'
        data = {'result': result}
        return render_to_json_response(data)

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

