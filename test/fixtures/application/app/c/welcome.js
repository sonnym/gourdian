module.exports = WelcomeController = function() {
  Controller.call(this);

  this.index = function() {
    return "Welcome to the Gourdian project!<br>The file you are looking at was created dynamically.";
  }

  this.streaming = function() {
    return { version: process.version };
  }
}
inherits(WelcomeController, Controller);
