FROM django
FROM python:3.6

ADD . /my-django-app

WORKDIR /my-django-app

RUN pip install --upgrade pip
RUN pip --version
RUN pip install -r requirements.txt


CMD [ "python", "./manage.py runserver 0.0.0.0:8000" ]
