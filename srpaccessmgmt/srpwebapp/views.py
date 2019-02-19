from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.template import RequestContext, loader
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.contrib.auth import logout
# default user table

# for forgot password feature
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template import loader
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.core.mail import send_mail

from django.contrib.auth.models import User

# import the models
from .models import *
# use this function for returning json data on ajax requests
import json

from .views_classes import *
# for ajax requests, returning JSON to JS
def render_to_json_response(context, **response_kwargs):
    data = json.dumps(context)
    response_kwargs['content_type'] = 'application/json'
    return HttpResponse(data, **response_kwargs)




# home page function
@csrf_exempt
def index(request):
    if request.user.is_authenticated:
        if request.user.is_superuser:
            print(User.objects.all()[0].id)
            for i in range(5):
                Visit(scheduled_date=datetime.date(2019,4,23), scheduled_start_time=datetime.time(2,00),
                      scheduled_end_time=datetime.time(3,45), user_id=2,
                      datetime_visit_was_scheduled=datetime.datetime.now()).save()

            print("All visit objects...")
            print(Visit.objects.all())
            print("\n\n")
            # get all visits, then visitors return to front end for display in table
            all_scheduled_visits = Visit.objects.all()

            # create json serializable objects that store the visitor name as well as visit information
            visit_objects = []
            for sv in all_scheduled_visits:
                visitor = User.objects.get(id=sv.user_id)
                visit_objects.append(Visit_Object(sv.id, sv.scheduled_start_time, sv.scheduled_end_time,sv.scheduled_date,
                                                  visitor.first_name,visitor.last_name))

            template = loader.get_template('main/home_admin.html')
            context = {
                'name': request.session['full_name'],
                'visit_objects': visit_objects,
            }
        else:
            template = loader.get_template('main/home_regular.html')
            context = {
                'name': request.session['full_name'],
            }
        if request.is_ajax() and request.POST.get('btnType') == 'logout':
            try:
                logout(request)
                result = 'logout success'
            except Exception as e:
                print(e)
                result = 'logout fail'
            data = {'result':result}
            return render_to_json_response(data)
    else: # not authenticated, direct to login page
        template = loader.get_template('main/login.html')
        context = {'':''}
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
    if request.is_ajax() and (request.POST.get('btnType') == 'password_reset_request'):
        try:
            validate_email(request.POST.get('email_address')) # is this an email address?
            # if so:
            associated_users = User.objects.filter(username=request.POST.get('email_address'))
            if associated_users.exists():
                # should only be one associated user
                for user in associated_users:
                    c = {
                        'email': user.username,
                        'domain': request.META['HTTP_HOST'],
                        'site_name': 'PolyPy',
                        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                        'user': user,
                        'token': default_token_generator.make_token(user),
                        'protocol': 'http',
                        }
                email_template_name = 'registration/password_reset_email.html'
                # copied from django/contrib/admin/templates/registration/password_reset_email.html to templates directory
                email = loader.render_to_string(email_template_name, c)
                send_mail("PolyPy Password Reset", email, 'error@amhajja.com', [user.email], fail_silently=False)
                data = {
                    'result': 'it worked'
                }
                return render_to_json_response(data)
            #if not successful, validation error
        except ValidationError as e:
            print(e)
            data = {
                'result': 'email DNE'
            }
            return render_to_json_response(data)

    template = loader.get_template('main/forgot-password.html')
    context = {
        '': '',
    }
    return HttpResponse(template.render(context, request))

# login page
@csrf_exempt
def srp_login(request):

    if request.is_ajax() and request.POST.get('btnType') == 'login':
        rp = request.POST
        try:
            result = 'auth fail' # initialize
            print("Authenticating...")
            user = authenticate(username=rp.get('email'), password=rp.get('password'))
            print(user)
            if user is not None:
                result = 'auth success'
                login(request, user)
                request.session['user_id'] = str(user.id)
                request.session['user_email'] = user.username
                request.session['full_name'] = user.first_name + ' ' + user.last_name

                print("Logging in..." )
                print("Full name: " + request.session['full_name'])
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
    if request.is_ajax() and request.POST.get('btnType') == 'register_new_account':
        rp = request.POST
        try:
            is_superuser = 0 if rp.get('accountType') == 'student' else 1
            result = 'register fail'
            # only create a new user if there is not already one with this username/email
            alreadyexists = User.objects.filter(username=rp.get('email'))
            alreadyexists.delete()
            if len(alreadyexists) == 0: # does not already exist
                print("No users with this username yet...")
                # create a new user instance (default User model from auth app
                newUser = User.objects.create_user(username=rp.get('email'),
                                                   email=rp.get('email'),
                                                   password=rp.get('password'),
                                                   first_name=rp.get('firstName'),
                                                   last_name=rp.get('lastName'),
                                                   is_superuser=is_superuser,
                                                   is_active=True)
                newUser.save()
                result = 'register success'
            else:
                print(alreadyexists[0])
        except Exception as e:
            print(e)
            result = e
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


