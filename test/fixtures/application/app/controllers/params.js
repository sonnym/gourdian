module.exports = ParamsController = function() {
  Controller.call(this);

  this.show = function() {
    return this._params.id;
  };

  this.form = function() {
    return this._params.secret
  };
}
inherits(ParamsController, Controller);
