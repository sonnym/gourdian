module.exports = RouterTest = function() {
  Test.call(this);
  var router = new Router();

  this.router_accurately_determines_if_http_or_socket_server_is_needed = function() {
    router.routes = null;
    assert.ok(!router.need_socket_server);
    assert.ok(!router.need_http_server);

    router.routes = {};
    assert.ok(!router.need_http_server);
    assert.ok(!router.need_socket_server);

    router.routes = { http: [ { something: 1 } ]};
    assert.ok(router.need_http_server);
    assert.ok(!router.need_socket_server);

    router.routes = { socket: [ { something: 1 } ]};
    assert.ok(!router.need_http_server);
    assert.ok(router.need_socket_server);

    router.routes = { socket: [ { something: 1 } ] , http: [ { something: 1 } ] };
    assert.ok(router.need_http_server);
    assert.ok(router.need_socket_server);
  };

  this.root_file_is_accurate = function() {
    router.routes = null;
    assert.ok(!router.root);
  }
}

inherits(RouterTest, Test);
