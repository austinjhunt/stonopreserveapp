"""srpaccessmgmt URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.conf.urls import url, include
from . import views

from django.contrib import admin
from django.urls import include, path

app_name = 'srpwebapp'
urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^404', views.err404, name='404'),
    url(r'^forgot-password',views.forgot_password,name='forgot_password'),
    url(r'^login', views.srp_login,name='login_page'),
    url(r'^register', views.register,name='register_page'),
    url(r'^activate/(?P<uidb64>[0-9A-Za-z_\-]+)/(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        views.activate, name='activate'),
    path('admin/', admin.site.urls)
]