#!/bin/sh
set -e

until mysql $DATABASE_URL -c '\l'; do
  >&2 echo "MYSQL is unavailable - sleeping"
  sleep 1
done

>&2 echo "MYSQL is up - continuing"

if [ "x$DJANGO_MANAGEPY_MIGRATE" = 'xon' ]; then
    /venv/bin/python manage.py migrate --noinput
Fi

if [ "x$DJANGO_MANAGEPY_COLLECTSTATIC" = 'xon' ]; then
    /venv/bin/python manage.py collectstatic --noinput
fi

exec "$@"
