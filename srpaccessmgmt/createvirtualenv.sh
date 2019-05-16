#!/bin/bash
virtualenv --python=python3.6 myvenv
# Now, the virtual environment should be ready to go. 
# Let's go ahead and activate it. 
source myvenv/bin/activate

# Install Cython individually, causes errors otherwise.
pip install Cython

# If you don't use the following lines, you'll get an error when trying to install mysqlclient ON MACOS. YOU CAN TRY COMMENTING THESE OUT IF USING A DIFFERENT OS.
# I got these lines from the output of "brew info openssl", which states: 
# openssl is keg-only, which means it was not symlinked into /usr/local,
# because Apple has deprecated use of OpenSSL in favor of its own TLS and crypto libraries.
#If you need to have openssl first in your PATH run:
echo 'export PATH="/usr/local/opt/openssl/bin:$PATH"' >> ~/.bash_profile
#For compilers to find openssl you may need to set:
export LDFLAGS="-L/usr/local/opt/openssl/lib"
export CPPFLAGS="-I/usr/local/opt/openssl/include"

# Now, we can use the requirements file to finish out installing our dependencies. 
pip install -r requirements.txt

