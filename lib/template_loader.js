var dust = require("dust");

exports = module.exports = TemplateLoader;

// currently only caches whether or not a cache has been streamed previously
function TemplateLoader(base_path) {
  this._base_path = base_path;
  this._template_cache = {};
}

TemplateLoader.prototype.run = function(path, ext, context, response) {
  // cache lookup
  var template_name = path + "." + ext
  if (this._template_cache[template_name]) {
    var pump = dust.stream(template_name, context);
    Gourdian.logger.info("Retrieved template for " + path + "." + ext + " from the cache");

  // fs lookup
  } else {
    var template_location = TemplateLoader.prototype.resolve_template.call(this, path, ext)
      , compiled_template = dust.compile(fs.readFileSync(template_location, "utf8"), template_name);

    dust.loadSource(compiled_template);

    var pump = dust.stream(template_name, context);
    this._template_cache[template_name] = true;

    Gourdian.logger.info("Retrieved template for " + path + "." + ext + " from the file system (" + template_location + ")");
  }

  // write headers
  response.writeHead(200, { "Content-Type": "text/html" });

  // write response via the pump function
  // function must be an event emitter w/ data, end, and error
  pump.on("data", function(data) { response.write(data) });
  pump.on("end", function() { response.end() });
  pump.on("error", function(error) { Gourdian.logger.info("Template Error: " + error) });
};

TemplateLoader.prototype.resolve_template = function(template_path, extension) {
 return path.join(this._base_path, "app", "v", template_path) + "." + extension + ".html";
};
