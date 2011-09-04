Gourdian
=

The simplest way to incorporate websockets into traditional web applications.

Starting a Project
-
Gourdian is now set up to be installed as an npm module, but is not yet published. This means it can be installed in a few easy steps.

- Install node 4.x.x
- Install npm
- `git clone https://github.com/sonnym/gourdian.git && cd gourdian && npm link`

Once these steps are completed, you will be able to start a new project by simply typing `gourdian --init project_directory` or `gourdian --init` in a directory you want to create a new project in.

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
