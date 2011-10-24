module.exports = ParamsController = function() {
  Controller.call(this);

  this.show = function() {
    return this._params.id;
  };
}
inherits(ParamsController, Controller);
