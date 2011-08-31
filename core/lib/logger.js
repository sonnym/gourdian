var log = exports;

// public variables

log.level = 'debug';
log.location = path.join(Gourdian.ROOT, "log", "development.log");
log.output = function(msg) {
  fs.open(log.location, 'a', function (err, fd) {
    fs.write(fd, (new Date()).toString() + ": " + msg.toString() + "\n", function (err, written) {
      fs.close(fd);
    });
  });
}

// private variables

var levels = { "debug": 1
             , "info": 2
             , "error": 3
             , "fatal": 4
             };

// public methods

log.debug = function(msg) {
  if (levelcalc(log.level) <= levels['debug']) log.output(msg);
}

log.info = function(msg) {
  if (levelcalc(log.level) <= levels['info']) log.output(msg);
};

log.error = function(msg) {
  if (levelcalc(log.level) <= levels['error']) log.output(msg);
};

log.fatal = function(msg) {
  if (levelcalc(log.level) <= levels['fatal']) log.output(msg);
};

log.separator = function() { log.output("============================="); }

// private methods

var levelcalc = function(lvl) {
  if (lvl && levels[lvl]) return levels[lvl];
  else console.log("invalid level");
}
