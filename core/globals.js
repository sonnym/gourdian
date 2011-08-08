// core libraries
global.fs = require("fs")
global.http = require("http")
global.path = require("path");
global.repl = require("repl")
global.url = require("url")
global.util = require("util")

// convenient contrivances 
global.inherits = util.inherits;

// useful libraries
global.Inflect = require("inflect-js");
global.GetOpt = require("v8cgi/lib/getopt.js").GetOpt

// core classes
global.Gourdian = require(path.join(__dirname, "gourdian"));

global.FileUtils = require("./lib/conveniences/file");

global.Config = require("./config")
global.Router = require("./router")

// user space classes
global.Controller = require("./controller")

global.Test = require(path.join(__dirname, "lib", "test"));
global.IntegrationTest = require(path.join(__dirname, "lib", "integration_test"));
global.UnitTest = require(path.join(__dirname, "lib", "unit_test"));


// 
/*
global.config = new Config()
global.router = new Router()
*/
