/* dependencies */
var dust = require("dustjs-linkedin");

/* constructor
 *
 * currently only caches whether or not a cache has been streamed previously
 *
 * @api public
 */
module.exports = TemplateLoader = function() {
  this._template_cache = {};
}

/* render a template with a given context
 *
 * @param {String} p internal path of template
 * @param {String} ext template extension
 * @param {Object} context
 * @param {Object} response
 * @api public
 */
TemplateLoader.prototype.run = function(p, ext, context, response) {
  this.load(p, ext, context, function(pump) {
    pump.on("data", function(data) { response.write(data) });
    pump.on("end", function() { response.end() });
    pump.on("error", function(error) { Logger.info("Template Error: " + error) });
  });
};

/* load a template from cache or file system
 *
 * @param {String} p internal path of template
 * @param {String} ext template extension
 * @param {Object} context
 * @param {Function} callback
 ** pump
 * @api public
 */
TemplateLoader.prototype.load = function(p, ext, context, callback) {
  var template_name = p + "." + ext

  // cache lookup
  if (this._template_cache[template_name]) {
    Logger.info("Retrieved template for " + template_name + " from the cache");

    callback(dust.stream(template_name, context));

  // fs lookup
  } else {
    var path_parts = p.split("/")
      , filename = path_parts.pop();

    var self = this;
    var configuration = new Configuration();

    configuration.operate_on_paths(["app", "views", path_parts, filename + "." + ext + ".html"], function(error, template_location) {
      var compiled_template = dust.compile(fs.readFileSync(template_location, "utf8"), template_name);

      dust.loadSource(compiled_template);

      self._template_cache[template_name] = true;

      callback(dust.stream(template_name, context));
    });
  }
}
