"""
WSGI config for srpaccessmgmt project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/2.1/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application


import sys
# server line!
"""
sys.path = ['/usr/local/venvs/srp_venv',
            '/usr/local/venvs/srp_venv/lib/python3.6',
            '/usr/local/venvs/srp_venv/lib/python3.6/site-packages',
            '/home/stono/public_html/webapps/srp_webapp/srpaccessmgmt',
            '/home/stono/public_html/webapps/srp_webapp/srpaccessmgmt/srpaccessmgmt',
            ]
"""


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'srpaccessmgmt.settings')

application = get_wsgi_application()
