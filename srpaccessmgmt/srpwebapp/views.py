from django.contrib.auth import authenticate, login, logout
from django.views.decorators.csrf import csrf_exempt
from django.template import RequestContext, loader
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.contrib.auth import logout
from django.core.files.storage import FileSystemStorage
# default user table

# for forgot password feature
from django.contrib.auth.tokens import default_token_generator
from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.template import loader
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.core.mail import send_mail

from django.contrib.auth.models import User
import datetime
# import the models
from .models import *
# use this function for returning json data on ajax requests
import json
import os


# for email verification
from .tokens import *
from django.template.loader import render_to_string
from django.core.mail import EmailMessage
from django.contrib.sites.shortcuts import get_current_site
import base64
import time

from .views_classes import *
from django.conf import settings
# for ajax requests, returning JSON to JS
def render_to_json_response(context, **response_kwargs):
    data = json.dumps(context)
    response_kwargs['content_type'] = 'application/json'
    return HttpResponse(data, **response_kwargs)





# home page function
@csrf_exempt
def index(request):
    if request.user.is_authenticated:
        # create json serializable objects that store the visitor name as well as visit information
        visit_objects = []
        if request.user.is_superuser: # if superuser, show ALL scheduled visits
            # get all visits, then visitors return to front end for display in table
            all_scheduled_visits = Visit.objects.all()

        else: # otherwise, just show personal scheduled visits
            all_scheduled_visits = Visit.objects.filter(user_id=request.user.id)

        for sv in all_scheduled_visits:
            visitor = User.objects.get(id=sv.user_id)
            visit_objects.append(Visit_Object(sv.id, sv.scheduled_start_time, sv.scheduled_end_time, sv.scheduled_date,
                                              visitor.first_name, visitor.last_name))

        # send images list
        imgfiles = []
        for img in Uploaded_Image.objects.all():
            # don't try to append if not a file
            if os.path.isfile("srpwebapp/" + img.img_path):
                # if exists, no exception, add to imgfiles
                imgfiles.append(Image_Object(_id=img.id,_datetime=img.upload_datetime,_uploader_id=img.uploader_id,
                                 _imgpath=img.img_path,_caption=img.caption))
            else:
                print("path does not exist yet.")


        if request.is_ajax() and request.POST.get('btnType') == 'logout':
            try:
                logout(request)
                result = 'logout success'
            except Exception as e:
                print(e)
                result = 'logout fail'
            data = {'result':result}
            return render_to_json_response(data)

        if request.is_ajax() and request.GET.get('btnType') == 'check_user_status_init':
            statusrecord = User_On_Property.objects.get(user_id=request.user.id)
            print("\n\nget request \n\n")
            status = 'off'
            if statusrecord.on_site:
                print("User on property")
                status = 'on'
            data = {
                'status': status
            }
            return render_to_json_response(data)

        if request.is_ajax() and request.POST.get('btnType') == 'super_create_user':
            res = ''
            try:
                fn = request.POST.get('firstname')
                ln = request.POST.get('lastname')
                email = request.POST.get('email')
                passwd = request.POST.get('pass')
                issuper = request.POST.get('issuper')
                isstaff = request.POST.get('isstaff')
                newUser = User.objects.create_user(username=email,email=email,
                                                   password=passwd,first_name=fn,last_name=ln,
                                                   is_superuser=issuper,is_staff=isstaff,
                                                   is_active=True)
                newUser.save()
                res = 'success'
            except:
                res = 'fail'
            data = {'result': res}
            return render_to_json_response(data)




        if request.is_ajax() and request.POST.get('btnType') == 'update_location':
            # get latitude and longitude; this will happen every 15 minutes, triggered by JS setInterval function.
            lat = request.POST.get('latitude')
            long = request.POST.get('longitude')
            try: # assuming browser returns these values properly
                lat = float(lat)
                long = float(long)
                print("\n\n\nUpdating location of user",request.user.first_name)
                print("New Lat:",str(lat))
                print("New Long:",str(long))
                # update current user's location with new location values
                current_user = User_On_Property.objects.get(user_id=request.user.id)
                current_user.latitude = lat
                current_user.longitude = long
                current_user.save()
                print("Successfully updated location of",request.user.first_name)
                res = 'success'
            except Exception as e:
                print(e)
                res = 'fail'
            data = {'res': res}
            return render_to_json_response(data)
        if request.is_ajax() and request.GET.get('btnType') == 'get_user_locations':
            user_on_property_objects = User_On_Property.objects.filter(on_site=True,
                                                        longitude__gte=-80.4,
                                                        longitude__lte=-79.8,
                                                        latitude__gte=32.65,
                                                        latitude__lte=32.8)

            # build locations dict structured as {userid: [long, lat]...}
            locations = {obj.user_id:[obj.longitude,obj.latitude] for obj in user_on_property_objects}

            # send a list of the respective users back as well; add list of users below map, so that clicking a
            # user centers map on their location

            users_on_site = [User_Object(_id=u.id,fn=u.first_name,ln=u.last_name,_email=u.email).toJSON()
                             for u in User.objects.filter(id__in=list(locations.keys()))]

            data = {
                'users_on_site': users_on_site,
                'locations':locations
            }
            return render_to_json_response(data)

        if request.is_ajax() and request.POST.get('btnType') == 'schedule_visit':
            start_time = request.POST.get('start_time')
            end_time = request.POST.get('end_time')
            visit_date = request.POST.get('visit_date')

            scheduleddate= datetime.datetime.strptime(visit_date,"%d %B, %Y")

            start_time = datetime.datetime.strptime(start_time, '%I:%M %p').replace(tzinfo=datetime.timezone.utc)
            start_time = start_time.time()
            end_time = datetime.datetime.strptime(end_time, '%I:%M %p').replace(tzinfo=datetime.timezone.utc).time()


            Visit(scheduled_date=scheduleddate, scheduled_start_time=start_time,scheduled_end_time=end_time,user_id=request.user.id,
                  datetime_visit_was_scheduled=datetime.datetime.now().replace(tzinfo=datetime.timezone.utc)).save()
            data = {'res':'success'}
            return render_to_json_response(data)
        if request.is_ajax() and request.POST.get('btnType') == 'delete_visit':
            try:
                Visit.objects.get(id=request.POST.get("visit_id")).delete()
                res = 'success'
            except Exception as e:
                print(e)
                res = 'fail'
            data = {'result': res}
            return render_to_json_response(data)
        if request.is_ajax() and request.POST.get('btnType') == 'edit_lock_code':
            # lock id is actually the primary key of the Gate table
            lock_id, new_lock_code,new_gate_num = request.POST.get('lock_id'), request.POST.get('new_lock_code'), \
                                     request.POST.get('new_gate_num')

            gate_to_edit = Gate.objects.filter(id=lock_id)[0] # use filter instead of get to avoid backend error on empty result
            gate_to_edit.lock_code = new_lock_code
            gate_to_edit.gate_number = new_gate_num
            gate_to_edit.save()

            # FIXME: send email notifying faculty and superusers (not the one requesting) that gate code has been changed.

        if request.is_ajax() and request.POST.get('btnType') == 'delete_lock_code':
            lock_id = request.POST.get('lock_id')
            Gate.objects.filter(id=lock_id).delete()
            data = {'res': 'success'}
            return render_to_json_response(data)

        if request.is_ajax() and request.POST.get('btnType') == 'create_new_gate':
            result = 'fail'
            try:
                gate_num, gate_code = int(request.POST.get('new_gate_num')),int(request.POST.get('new_gate_code'))
                result = 'success'
                Gate(lock_code=gate_code,gate_number=gate_num).save()

                # FIXME: send email notifying faculty and superusers (not the one requesting) that new gate has been
                # created with code xxxx ^^

            except Exception as e:
                print(e)

            data = {
                'result': result
            }
            return render_to_json_response(data)

        if request.is_ajax() and request.POST.get('btnType') == 'change_user_status':

            try:
                to = request.POST.get('to')
                useronsite = User_On_Property.objects.get(user_id=request.user.id)
                useronsite.on_site = True if to == 'on' else False
                useronsite.save()
                print("Changing user", request.user.first_name,"status to", useronsite.on_site)
                result = 'success'
            except Exception as e:
                print(e)
                result = 'fail'
            data = {
                'result': result
            }
            return render_to_json_response(data)

        if request.is_ajax() and request.POST.get('btnType') == 'delete_user':
            uid = request.POST.get('userid')
            res = ''
            if int(uid) == request.user.id:
                res = 'cantdeleteself'
            else:
                User.objects.get(id=uid).delete()
                res = 'success'
            data = {
                'result': res
            }
            return render_to_json_response(data)
        # photo upload
        try:
            if request.method == "POST" and request.FILES['photo_file']:
                fs = FileSystemStorage(location='srpwebapp/static/main/img')
                fname = fs.save(request.FILES['photo_file'].name, request.FILES['photo_file'])
                # create record in database
                imgpath = '/static/main/img/' + fname
                Uploaded_Image(uploader_id=request.user.id,
                              upload_datetime=datetime.datetime.now(),
                              img_path=imgpath,
                               caption=request.POST['caption']).save()
                # don't immediately reload page, otherwise new image won't show
        except Exception as e:
            print(e)
        # photo delete
        if request.is_ajax() and request.POST.get('btnType') == 'delete_photo':
            imgid = request.POST.get('imgid')
            imgpath = request.POST.get('imgpath')
            res = ''
            try:
                # delete db record
                Uploaded_Image.objects.get(id=imgid).delete()
                # delete actual file
                os.remove('srpwebapp' + imgpath)
                res = 'success'
            except Exception as e:
                print(e)
                res = 'fail'
            data = {'result': res}
            return render_to_json_response(data)

        if request.is_ajax() and request.POST.get('btnType') == 'add_announcement':
            res = ''
            try:
                announcement_title = request.POST.get('announcement_title')
                annoucement_body = request.POST.get('announcement_body')
                # create the announcement record
                Announcement(datetime_created=datetime.datetime.now(),user_id=request.user.id,
                             announcement=annoucement_body,title=announcement_title).save()
                res = 'success'
            except:
                res = 'fail'
            data = {'result': res}
            return render_to_json_response(data)

        if request.is_ajax() and request.POST.get('btnType') == 'delete_announcement':
            res = ''
            try:
                Announcement.objects.get(id=request.POST.get('a_id')).delete()
                res = 'success'
            except:
                res = 'fail'
            data = {'result': res}
            return render_to_json_response(data)



        # get all the announcements from last 30 days
        announcements = []
        for a in Announcement.objects.filter(datetime_created__lte=datetime.datetime.today(),
                                             datetime_created__gt=datetime.datetime.today() - datetime.timedelta(
                                                 days=30)):
            username = a.user.first_name + ' ' + a.user.last_name

            # the database is 4 hours ahead, so adjust the datetime.
            dt = a.datetime_created - datetime.timedelta(hours=4)
            # create a json serializable object
            announcements.append(Announcement_Object(_id=a.id,
                                                     ann=a.announcement,
                                                     _title=a.title,
                                                     _uname=username,
                                                     date_created=dt.date(),
                                                     time_created=dt.time()))


        lock_codes = Gate.objects.all() # will only ever be one in table. delete current for gate when new one created

        all_users = [User_Object(_id=u.id, fn=u.first_name, ln=u.last_name,dj=u.date_joined,_email=u.email,
                                 nv=len(Visit.objects.filter(user_id=u.id))) for u in User.objects.all()]

        template = loader.get_template('main/home.html')

        print("Your first name is", request.session['first_name'])

        context = {
            'current_user': request.user, # use this on front end for toggling visibilities of elements
            'first_name': request.session['first_name'],
            'full_name': request.session['full_name'],
            'imgs': imgfiles,
            'visit_objects': visit_objects,
            'announcements': announcements,
            'lock_codes': lock_codes,
            'all_users': all_users,

        }
        print("return home page...")
        return HttpResponse(template.render(context, request))

    else: # not authenticated, direct to login page
        uri = request.build_absolute_uri()
        print("\n\n\n",uri)
        print("not authenticated...")
        if "127.0.0.1:8000" in uri:
            print("return login")
            return HttpResponseRedirect('/login/')

        elif "153.9.205.25" in uri:
            return HttpResponseRedirect('http://153.9.205.25/stonoriverapp/login/')





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
                        'site_name': 'SRP Access Management',
                        'uid': urlsafe_base64_encode(force_bytes(user.pk)),
                        'user': user,
                        'token': default_token_generator.make_token(user),
                        'protocol': 'http',
                        }
                email_template_name = 'registration/password_reset_email.html'
                # copied from django/contrib/admin/templates/registration/password_reset_email.html to templates directory
                email = loader.render_to_string(email_template_name, c)
                send_mail("SRP Password Reset", email, 'srpaccess@cofc.edu', [user.email], fail_silently=False)
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
    if request.user.is_authenticated:
        # this only works on server...
        uri = request.build_absolute_uri()
        if "127.0.0.1:8000" in uri:
            return HttpResponseRedirect('/')

        elif "153.9.205.25" in uri:
            return HttpResponseRedirect('/stonoriverapp')
    if request.is_ajax() and request.POST.get('btnType') == 'login':
        rp = request.POST
        try:
            result = 'auth fail' # initialize)
            user = authenticate(username=rp.get('email'), password=rp.get('password'))
            if user is not None:
                result = 'auth success'
                login(request, user)
                request.session['user_id'] = str(user.id)
                request.session['user_email'] = user.username
                request.session['first_name'] = user.first_name
                print("Logging in...")
                print("Your first name is", request.session['first_name'])
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
    #User.objects.filter(email='huntaj@g.cofc.edu').delete()
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

            is_staff = 0 if rp.get('accountType') == 'student' else 1
            is_superuser = 0 #FIXME: HOW TO CREATE ADMIN ACCTS
            result = 'register fail'
            # only create a new user if there is not already one with this username/email
            alreadyexists = User.objects.filter(username=rp.get('email'))
            alreadyexists.delete()
            if len(alreadyexists) == 0: # does not already exist
                # create a new user instance (default User model from auth app

                # Comment out this portion, unusable by server due to smtp port being blocked,
                # cannot send mail to gmail's smtp server

                newUser = User.objects.create_user(username=rp.get('email'),
                                                   email=rp.get('email'),
                                                   password=rp.get('password'),
                                                   first_name=rp.get('firstName'),
                                                   last_name=rp.get('lastName'),
                                                   is_superuser=is_superuser,
                                                   is_staff=is_staff,
                                                   is_active=False) # make is_active false initially until email verified
                newUser.save()
                print("Your new user id is " + str(newUser.id))

                # Send a verification email to the address they provided.
                mail_subject = 'Activate your SRP Web App Account'
                uid = urlsafe_base64_encode(force_bytes(newUser.id)).decode()
                print("Creating UID with base64 encoding....\n")
                print(uid)
                print("Domain:" + get_current_site(request).domain)
                uri = request.build_absolute_uri()
                # change the link that you give them if local host
                localhost = False
                if "127.0.0.1:8000" in uri:
                    localhost = True
                msg_html = render_to_string('main/acc_active_email.html', {
                    'user': newUser,
                    'domain': get_current_site(request).domain,
                    'uid': uid,
                    'token': account_activation_token.make_token(newUser),
                    'localhost': localhost,
                })
                send_mail(
                    message=None,
                    subject='SRP Email Verification',
                    from_email='srpaccess@cofc.edu',
                    recipient_list=[rp.get('email')],
                    html_message=msg_html,
                )


                result = 'email sent'
            else:
                result = 'email taken'
        except Exception as e:
            print(e)
            result = str(e)

        data = {'result': result}
        return render_to_json_response(data)

    template = loader.get_template('main/register.html')
    context = {
        '': '',
    }
    return HttpResponse(template.render(context, request))


# function for account activation
def activate(request, uidb64, token):
    try:
        uid = force_text(urlsafe_base64_decode(uidb64))
        user = User.objects.get(id=uid)

    except Exception as e:
        user = None
    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()

        # create a User_On_Property record for this user, set boolean to False
        User_On_Property(user_id=user.id, on_site=False).save()
        # return redirect('home')
        context = {
            'success': 1,
        }
    else:
        context = {
            'success': 0,
        }

    template = loader.get_template('main/email_verification_result.html')
    return HttpResponse(template.render(context,request))


# admin page
@csrf_exempt
def admin(request):

    template = loader.get_template()
    context = {
        '': '',
    }
    return HttpResponse(template.render(context, request))

