var WelcomeController = module.exports = function() {
  Gourdian.Controller.call(this);

  this.index = function() {
    return "Welcome to the Gourdian project!<br>The file you are looking at was created dynamically.";
  }

  this.streaming = function() {
    return { version: process.version };
  }

  /*
  return {
    index: function() {
      return "Welcome to the Gourdian project!<br>The file you are looking at was created dynamically.";
    }
    , streaming: function() {
      return { version: process.version };
    }
  };
  */
}
inherits(WelcomeController, Gourdian.Controller);

/*
WelcomeController.prototype.index = function() {
  return "Welcome to the Gourdian project!<br>The file you are looking at was created dynamically.";
}
WelcomeController.prototype.streaming = function() {
  return { version: process.version };
}
*/
