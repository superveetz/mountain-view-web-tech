'use strict';

module.exports = function(server) {
  // Install a `/` route that returns server status
  var router = server.loopback.Router();

  router.get('/*', function (req, res) {
    return res.render('index.' + process.env.NODE_ENV.toString() + '.html', {
      pageTitle: 'Loopback Test'
    });
  });
  
  server.use(router);
};
