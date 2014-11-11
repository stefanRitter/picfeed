/*jshint camelcase: false */
'use strict';

var Boom = require('boom'),
    server = {};

var twitter = require('twitter');

var twit = new twitter({
    consumer_key:         process.env.TWIT_KEY          || 'testing',
    consumer_secret:      process.env.TWIT_SECRET       || 'testing',
    access_token_key:     process.env.TWIT_TOKEN        || 'testing',
    access_token_secret:  process.env.TWIT_TOKEN_SECRET || 'testing'
});

function restTimeline (request, reply) {
  var userId = request.auth.credentials.id;

  var query = {
    user_id: userId,
    include_entities:true,
    count: 200
  };

  twit.get('/statuses/user_timeline.json', query, function(data, res) {
    if (res.statusCode !== 200) { return reply(Boom.badImplementation('twitter code: '+res.statusCode)); }

    console.log('found: ', data.length);
    reply(data);
  });
}

module.exports = function (_server) {
  server = _server;

  [
    {
      method: 'GET',
      path: '/twitter/timeline',
      config: {
        handler: restTimeline,
        auth: 'session'
      }
    }
  ]
  .forEach(function (route) { server.route(route); });
};
