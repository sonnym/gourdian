// core libraries
global.fs = require("fs")
global.http = require("http")
global.path = require("path");
global.url = require("url")
global.util = require("util")

// convenient contrivances
global.inherits = util.inherits;

// useful libraries
global.GetOpt = require("v8cgi/lib/getopt.js").GetOpt

// core classes
global.Gourdian = require(path.join(__dirname, "gourdian"));
global.Server = require(path.join(__dirname, "server"));

global.ext = {};
global.ext.File = require(path.join(__dirname, "ext", "file"));
global.ext.Inflect = require("inflect-js");

global.Config = require(path.join(__dirname, "config"));
global.Router = require(path.join(__dirname, "router"));

global.ControllerLoader = require(path.join(__dirname, "controller_loader"));

// user space classes
global.Controller = require(path.join(__dirname, "controller"));

global.Test = require(path.join(__dirname, "test"));
global.IntegrationTest = require(path.join(__dirname, "integration_test"));
