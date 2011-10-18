// core libraries
global.child_process = require("child_process")
global.crypto = require("crypto");
global.fs = require("fs")
global.http = require("http")
global.path = require("path");
global.url = require("url")
global.util = require("util")

// convenient contrivances
global.exec = child_process.exec;
global.spawn = child_process.spawn;

global.inherits = util.inherits;

// useful libraries
global.GetOpt = require("v8cgi/lib/getopt.js").GetOpt
global._ = require("underscore");

// extensions
global.ext = {};
global.ext.Console = require(path.join(__dirname, "ext", "console"));
global.ext.File = require(path.join(__dirname, "ext", "file"));
global.ext.Sync = require(path.join(__dirname, "ext", "sync"));
global.ext.Inflect = require("inflect-js");

// core classes
global.Logger = require("./logger");
global.ClassLoader = require(path.join(__dirname, "class_loader"));

var class_loader = new ClassLoader();
class_loader.load(path.join(Gourdian.framework_root, "lib", "loaders"), null, { pollute: true, prefix: 1});

global.Configuration = require(path.join(__dirname, "configuration"));

// server classes
global.Server = require(path.join(__dirname, "server"));
global.Router = require(path.join(__dirname, "router"));
global.SessionStore = require(path.join(__dirname, "session_store"));

global.IHandler = require(path.join(__dirname, "ihandler"));
class_loader.load(path.join(Gourdian.framework_root, "lib", "handlers"), null, { pollute: true, prefix: 1});

// user space classes
global.Controller = require(path.join(__dirname, "controller"));

// test classes
global.TestRunner = require(path.join(__dirname, "test_runner"));
global.Test = require(path.join(__dirname, "test"));
global.TestClient = require(path.join(__dirname, "test_client"));
