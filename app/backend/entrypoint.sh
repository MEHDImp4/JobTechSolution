#!/bin/sh
set -e

if [ "${DATABASE_URL#mysql://}" != "$DATABASE_URL" ]; then
  echo "Waiting for MySQL..."
  until nc -z db 3306; do
    sleep 1
  done
fi

python manage.py migrate --noinput
python manage.py seed_data
python manage.py runserver 0.0.0.0:8000
