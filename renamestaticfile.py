import sys
import os
# This is a script for quickly renaming and updating the two most commonly updated static files: main_x.js and
# srpstyle_x.js
# From this directory in Terminal/Command prompt:
# python renamestaticfile.py srpaccessmgmt/srpwebapp/static/main/js/main_x.js or '....main/css/srpstyle_x.js'
# This will rename the files and update the references to them in the masterpage.html template.

# We need to do this to ensure that we overwrite cached versions of old static files. On desktop, you can disable
# caching by opening dev tools, but this is a mobile-centric app, and you can't easily do this on mobile, so we must
# force-overwrite these static files which are commonly edited/updated.


def renamestaticfile():
	patharg = sys.argv[1]
	oldfilename = patharg.split('/')[-1]
	
	# handle css filename update
	if ".css" in oldfilename:
		os.chdir('srpaccessmgmt/srpwebapp/static/main/css/')
		# get current version
		currversion = int(oldfilename.split('.')[0].split('_')[1])
		# update version number
		newversion = currversion + 1
		newfilename = "srpstyle_" + str(newversion) + ".css"
	# handle js filename update
	if ".js" in oldfilename:
		os.chdir('srpaccessmgmt/srpwebapp/static/main/js/')
		# get current version
		currversion = int(oldfilename.split('.')[0].split('_')[1])
		# update version number
		newversion = currversion + 1
		newfilename = "main_" + str(newversion) + ".js"
	# either file type functionality
	# rename file 
	print("Renaming",oldfilename,"to",newfilename,"...")
	os.rename(oldfilename, newfilename)

	# update reference in masterpage.html
	os.chdir('../../../templates/main/')
	with open('masterpage.html','r') as readmaster:
		content = readmaster.read() 
		print("Updating references in masterpage.html...")
		newcontent = content.replace(oldfilename,newfilename)
		with open('masterpage.html','w') as writemaster: 
			writemaster.write(newcontent)

	print("All updates complete!")

if __name__ == "__main__": 
	
	renamestaticfile()
