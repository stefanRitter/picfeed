'use strict';

var User = require('mongoose').model('User'),
    Boom = require('boom'),
    server = {};


function loadMoreTweets (request, reply) {
  User.findOne({_id: request.auth.credentials._id}, function (err, user) {
    if (err || !user) { return reply(Boom.badImplementation(err)); }
    
    var lastTweetId = request.query.lastTweet;
    user.paginateFeed(lastTweetId, reply);
  });
}

function refreshTweets (request, reply) {
  User.findOne({_id: request.auth.credentials._id}, function (err, user) {
    if (err || !user) { return reply(Boom.badImplementation(err)); }
    
    user.refreshFeed(reply);
  });
}

module.exports = function (_server) {
  server = _server;

  [
    {
      method: 'GET',
      path: '/feed',
      config: {
        auth: 'session',
        handler: {
          file: 'html/index.html'
        }
      }
    },
    {
      method: 'GET',
      path: '/feed/next',
      config: {
        auth: 'session',
        handler: loadMoreTweets,
      }
    },
    {
      method: 'GET',
      path: '/feed/refresh',
      config: {
        auth: 'session',
        handler: refreshTweets,
      }
    }
  ]
  .forEach(function (route) { server.route(route); });
};
