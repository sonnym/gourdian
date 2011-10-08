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

// core classes
global.TestRunner = require(path.join(__dirname, "test_runner"));
global.Server = require(path.join(__dirname, "server"));

global.ext = {};
global.ext.Console = require(path.join(__dirname, "ext", "console"));
global.ext.File = require(path.join(__dirname, "ext", "file"));
global.ext.Sync = require(path.join(__dirname, "ext", "sync"));
global.ext.Inflect = require("inflect-js");

global.Config = require(path.join(__dirname, "config"));
global.Router = require(path.join(__dirname, "router"));

global.ControllerLoader = require(path.join(__dirname, "controller_loader"));
global.SessionStore = require(path.join(__dirname, "session_store"));
global.TemplateLoader = require(path.join(__dirname, "template_loader"));

// user space classes
global.Controller = require(path.join(__dirname, "controller"));

global.Test = require(path.join(__dirname, "test"));
global.TestClient = require(path.join(__dirname, "test_client"));
global.IntegrationTest = require(path.join(__dirname, "integration_test"));
global.PerformanceTest = require(path.join(__dirname, "performance_test"));
global.AcceptanceTest = require(path.join(__dirname, "acceptance_test"));
