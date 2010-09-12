var fs = require("fs");

var log = exports;

// public variables

log.level = 'info';
log.location = '../log/development.log'; // seems reasonable
log.output = function(msg) {
  fs.open(log.location, 'a', function (err, fd) {
    fs.write(fd, (new Date()).toString() + ": " + msg + "\n", function (err, written) {
      fs.close(fd);
    });
  });
}

// private variables

var levels = { 'info': 1
             , 'debug': 2
             , 'fatal': 3
             };

// public methods

log.debug = function(msg) {
  if (levelcalc(log.level) >= levels['debug']) log.output(msg);
}

log.info = function(msg) {
  if (levelcalc(log.level) >= levels['info']) log.output(msg);
};

log.fatal = function(msg) {
  if (levelcalc(log.level) >= levels['fatal']) log.output(msg);
};

// private methods

var levelcalc = function(lvl) {
  if (lvl && levels[lvl]) return levels[lvl];
  else console.log("invalid level");
}
