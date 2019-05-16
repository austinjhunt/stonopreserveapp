# capstone-2019-cofc
Note: Be sure to use python version 3.6.3 for this project. 
1) Create a directory on your computer (ex: /Desktop/mydirectory) 
2) Navigate to that directory.
3) clone this repo
4) create a virtual environment  with python version 3.6.3 specified.

***Be sure to activate the virtual environment you have created whenever you are modifying/executing code in the project.***

Please ensure that your virtual environment is not inside the repository when you commit.
There is no need to include the massive virtualenv folders inside the repo; instead, we can simply use the requirements.txt
to maintain the dependencies/necessary installs.

Daniel Lee (Feb 4)

Austin Hunt (Mar 4)

Alex Thropp (April 1)

### March 24, 2019: Creating an SSH Tunnel to our shared remote MySQL Database
https://www.linode.com/docs/databases/mysql/create-an-ssh-tunnel-for-mysql-remote-access/

Instead of Dr. van Delden granting our "stono" user rights to access the "stono" database from any IP address/host, we can use SSH tunnels to connect to the database, essentially mapping the remote MySQL service on 153.9.205.25:3306 to localhost:3306, or 127.0.0.1:3306. If you create this SSH tunnel, then you can connect to the database without having to modify the remote MySQL user privileges. The point: avoid using SQLite!

Shortcut: if you're using Mac OS, use the command: 

###### ssh stono@153.9.205.25 -L 3306:127.0.0.1:3306 -N

to create the tunnel. This must be done before running the dev server.

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
