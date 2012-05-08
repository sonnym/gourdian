#! /usr/bin/env node

require("gourdian");

var bp_lt = function(n) { return { "controller": { source: path.join(gourdian.ROOT, "boilerplate", "app", "c.js")
                                                 , destination: path.join("app", "c", n + ".js")
                                                 , from: "CONTROLLERNAME"
                                                 , to: n
                                                 }
                                 , "integration_test": { source: path.join(gourdian.ROOT, "boilerplate", "test", "integration.js")
                                                       , destination: path.join("test", "integration", n + ".js")
                                                       , from: "TESTNAME"
                                                       , to: n
                                                       }
                                 , "unit_test": { source: path.join(gourdian.ROOT, "boilerplate", "test", "unit.js")
                                                , destination: path.join("test", "unit", n + ".js")
                                                , from: "TESTNAME"
                                                , to: n
                                                }
                                 }
                        };

// handle options
var opts = new GetOpt();
opts.add("type", "Type of object to generate", "", "t", "type", GetOpt.REQUIRED_ARGUMENT);
opts.add("name", "Name of object to generate", "", "n", "name", GetOpt.REQUIRED_ARGUMENT);

try {
  opts.parse(process.argv);
} catch (e) {
  console.log(e + "\nGourdian server script usage: \n\n" + opts.help());
  return;
}

var name = opts.get("name");

switch (opts.get("type")) {
  case "controller":
    copy_file_with_replace_if_not_exists(bp_lt(name).controller);
    break;
  case "model":
    copy_file_with_replace_if_not_exists(bp_lt(name).model);
    break;
  case "integration_test":
    copy_file_with_replace_if_not_exists(bp_lt(name).integration_test);
    break;
  case "unit_test":
    copy_file_with_replace_if_not_exists(bp_lt(name).unit_test);
    break;
  default:
    console.log("Invalid type of object");
    return;
}

function copy_file_with_replace_if_not_exists(args) {
  if (fs.existsSync(args.destination)) {
    console.log(args.destination + " present");
    return;
  }

  fs.readFile(args.source, function(read_err, data) {
    if (read_err) console.log("\nERROR:  Unable to read file " + args.source);

    var regex = new RegExp(args.from)
      , output = data.toString().replace(regex, args.to);

    fs.writeFile(args.destination, output, function(write_err) {
      if (write_err) console.log("\nERROR: Unable to write file " + args.destination + " " + write_err);
      else console.log(args.destination + " created");
    });
  });
}
