from .views import *
from .models import *
import json
import datetime

# use this json serialization function particularly for objects with dates as fields
def json_default(value):
    if isinstance(value, datetime.datetime):
        return dict(year=value.year, month=value.month, day=value.day, hour=value.hour,min=value.minute,sec=value.second)

    elif isinstance(value, datetime.date):
        return dict(year=value.year,month=value.month,day=value.day)

    elif isinstance(value,datetime.time):
        value = value.strftime("%I:%M")
        print("value 1: ",value)
        value = datetime.datetime.strptime(value, "%H:%M")
        print("value2:",value)
        return dict(hour=value.hour,min=value.minute)

    else:
        return value.__dict__


# class that stores visit start and end time, visit date, student name
class Visit_Object:
    def __init__(self, _id,_start_time, _end_time, _visit_date, _visitor_first_name,_visitor_last_name):
        self.id = _id
        self.start_time = _start_time
        self.end_time = _end_time
        self.visit_date = _visit_date
        self.visitor_first_name = _visitor_first_name
        self.visitor_last_name = _visitor_last_name

    # toJson method that converts data to json object for front end JS parsing
    def toJSON(self):
        return json.dumps(self, default=lambda o: json_default(o), sort_keys=True, indent=4)

# class to store announcement with name of user who created it
class Announcement_Object:
    def __init__(self,_id,ann,user,date_created):
        self.id=_id
        self.announcement = ann
        self.user_name = user.first_name + ' ' + user.last_name
        self.date_created = date_created

# class to store users along with their total number of visits
class User_Object:
    def __init__(self,_id,fn,ln,dj,nv,_email):
        self.id=_id
        self.first_name = fn
        self.last_name = ln
        self.date_joined = dj
        self.num_visits = nv
        self.email = _email

    # toJson method that converts data to json object for front end JS parsing
    def toJSON(self):
        return json.dumps(self, default=lambda o: json_default(o), sort_keys=True, indent=4)
