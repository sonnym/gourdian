global.path = require("path");
global.inherits = require("util").inherits;

global.Gourdian = require(path.join(__dirname, "gourdian"));

global.Test = require(path.join(__dirname, "lib", "test"));
global.IntegrationTest = require(path.join(__dirname, "lib", "integration_test"));
global.UnitTest = require(path.join(__dirname, "lib", "unit_test"));
