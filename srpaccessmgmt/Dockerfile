FROM django
FROM python:3.6
MAINTAINER Austin Hunt

ADD . /my-django-app

WORKDIR /my-django-app

RUN pip install --upgrade pip
RUN pip --version
RUN python --version
RUN pip install -r requirements.txt

EXPOSE 8000
CMD exec gunicorn srpaccessmgmt.wsgi:application --bind 0.0.0.0:8000 --workers 3


CMD [ "python", "manage.py", "runserver","0.0.0.0:8000" ]
