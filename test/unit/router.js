var Router = require("./../../lib/router");

exports.router_accurately_determines_if_http_or_socket_server_is_needed = function(test) {
  var router = new Router();

  router.routes = null;
  test.ok(!router.need_socket_server);
  test.ok(!router.need_http_server);

  router.routes = {};
  test.ok(!router.need_http_server);
  test.ok(!router.need_socket_server);

  router.routes = { http: [ { something: 1 } ]};
  test.ok(router.need_http_server);
  test.ok(!router.need_socket_server);

  router.routes = { socket: [ { something: 1 } ]};
  test.ok(!router.need_http_server);
  test.ok(router.need_socket_server);

  router.routes = { socket: [ { something: 1 } ] , http: [ { something: 1 } ] };
  test.ok(router.need_http_server);
  test.ok(router.need_socket_server);

  test.done();
}

exports.root_file_is_accurate = function(test) {
  var router = new Router();

  router.routes = null;
  test.ok(!router.root);

  test.done();
}
