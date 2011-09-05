Gourdian
=

The simplest way to incorporate websockets into traditional web applications.

Installation
-
Gourdian is now set up to be installed as an npm module, but is not yet published. This means it can be installed in a few easy steps.

- Install node 0.4.x
- Install npm
- `git clone https://github.com/sonnym/gourdian.git && cd gourdian && npm link`

Starting a Project
-
Once Gourdian is installed, staring a project is simple.  Simply navigate to the folder you want to contain the project and type: `gourdian init`.

You can also specify a path, e.g. `gourdian init path/to/project`.

This directory will server as the root folder of your project. Initialization will create all the files necessary to begin working on a web application immediately.

Running a Server
-
The server is easily started by running:
	./script/server.js

This will start the server with a REPL by default.  To  stop the server, simply type `stop();` in the REPL.

Routes
-

Tests
-

MVC
-

Gourdian object.
-
Included globally is the Gourdian object.  At present, it contains the logger and a simple alias for deep inspection of objects.
