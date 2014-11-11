'use strict';

module.exports = function (config, server) {
  require('../controllers/auth.js')(server);
  
  require('../controllers/twitter.js')(server);

  server.route({
    method: 'GET',
    path: '/assets/{param*}',
    handler: {
      directory: {
        path: '../public',
        defaultExtension: 'html'
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/favicon.ico',
    handler: {
      file: 'img/favicon.ico'
    }
  });

  server.route({
    method: 'GET',
    path: '/feed',
    handler: {
      file: 'html/index.html'
    }
  });

  server.route({
    method: 'GET',
    path: '/',
    handler: {
      file: 'html/index.html'
    }
  });

  // respond to Chrome pre-fetching
  server.route({
    method: 'GET',
    path: '/%7B%7Btweet.profile_image_url%7D%7D',
    handler: {
      file: 'img/twitter.svg'
    }
  });

  return server;
};
