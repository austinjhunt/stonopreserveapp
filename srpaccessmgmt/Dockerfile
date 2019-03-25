FROM python:3.6-alpine

# Copy in your requirements file
ADD requirements.txt /requirements.txt

# OR, if you’re using a directory for your requirements, copy everything (comment out the above and uncomment this if so):
# ADD requirements /requirements

# Install build deps, then run `pip install`, then remove unneeded build deps all in a single step. Correct the path to your production requirements file, if needed.
RUN set -ex \
    && apk add --no-cache --virtual .build-deps \
            gcc \
            make \
            libc-dev \
            musl-dev \
            linux-headers \
            pcre-dev \
	    py-mysqldb \ 
	    mysql-client \ 
            postgresql-dev \
	    mariadb-dev \
	    freetds-dev \
	    openssl-dev \
	    pcre-dev \
	    build-base \
    && pyvenv /venv  \
    && /venv/bin/pip install -U pip \
    && /venv/bin/pip install -U Cython \
    && LIBRARY_PATH=/lib:/usr/lib:/usr/local/mysql/bin:/usr/local/bin/  /bin/sh -c "/venv/bin/pip install --no-cache-dir -r /requirements.txt" \
    && runDeps="$( \
            scanelf --needed --nobanner --recursive /myvenv \
                    | awk '{ gsub(/,/, "\nso:", $2); print "so:" $2 }' \
                    | sort -u \
                    | xargs -r apk info --installed \
                    | sort -u \
    )" \
    && apk add --virtual .python-rundeps $runDeps \

# Copy your application code to the container (make sure you create a .dockerignore file if any large files or directories should be excluded)
RUN mkdir /code/
WORKDIR /code/
ADD . /code/

# uWSGI will listen on this port
EXPOSE 8000

# Add any custom, static environment variables needed by Django or your settings file here:
ENV DJANGO_SETTINGS_MODULE=srpaccessmgmt.settings

# uWSGI configuration (customize as needed):
ENV UWSGI_VIRTUALENV=/venv UWSGI_WSGI_FILE=srpaccessmgmt/wsgi.py UWSGI_HTTP=:8000 UWSGI_MASTER=1 UWSGI_WORKERS=2 UWSGI_THREADS=8 UWSGI_UID=1000 UWSGI_GID=2000 UWSGI_LAZY_APPS=1 UWSGI_WSGI_ENV_BEHAVIOR=holy

# Call collectstatic (customize the following line with the minimal environment variables needed for manage.py to run):
#RUN DATABASE_URL=mysql://stono@localhost/stono   /venv/bin/python manage.py collectstatic --noinput

#ENTRYPOINT ["/code/docker-entrypoint.sh"]

# Start uWSGI
#CMD ["/venv/bin/uwsgi","--http-auto-chunked", "--http-keepalive"]
#CMD ["/venv/bin/python","manage.py","runserver","0.0.0.0:8000"]
