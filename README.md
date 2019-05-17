# capstone-2019-cofc
## Getting Started
#### 1) clone the repository.
#### 2) navigate to the outer srpaccessmgmt directory. 
#### 3) execute the createvirtualenv.sh script. I primarily created this script for MacOS users, because installing mysqlclient throws a lot of build errors that must be solved by modifying environment variables. 
#### 4) This script will generate and prepare a virtual environment called "myvenv" with all of the necessary dependencies installed. Be sure to activate this script manually once the script is finished executing. 

### March 24, 2019: Creating an SSH Tunnel to our shared remote MySQL Database
https://www.linode.com/docs/databases/mysql/create-an-ssh-tunnel-for-mysql-remote-access/

Shortcut: if you're using Mac OS, use the following command to create an SSH tunnel to the Stono App database: 

###### ssh \<your username\>@<the server's ip address> -L 3306:127.0.0.1:3306 -N

to create the tunnel. This must be done before running the dev server. You must know the database password for this to work. Login information may be provided by Dr. Sebastian van Delden. 

Since location services have been added to the project, we must run the application using HTTPS. It will not work over HTTP. So, in order to serve with HTTPS from localhost, I added the django-extensions app to the project. So now, instead of running 

###### python manage.py runserver

You should instead use

###### python manage.py runserver_plus --cert certname

This will enable the HTTPS protocol to work on localhost. 


### Maintenance/Updates

#### For anyone with access to the server who is making updates to the site, the following is the process to follow for making changes: 
##### 1) If the file you changed is a static file (i.e. javascript or css, most likely), you need to rename that file before uploading to the server so that users' browsers do not use the old cached version. I've added a script for this. In the outer directory of the repo, you can use (with your virtual environment activated) 
###### python renamestaticfile.py <full path to static file, e.g. srpaccessmgmt/srpwebapp/static/main/js/main_xx.js>
##### The same command can be used for updating a CSS file. This will update the name of the file as well as any references to it in the HTML templates.

##### 2) Use an SFTP client (I prefer Forklift) to move the files to the server. 
##### 3) SSH to the server and run ./updateApp.sh from the stono user's home directory. This will run the collectstatic command and restart Apache. You need to know the root password for this. 
