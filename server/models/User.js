'use strict';

var mongoose = require('mongoose'),
    schema;


schema = mongoose.Schema({  
  id: {
    type: String,
    index: true
  },
  username: String,
  displayName: String,
  token: String,
  secret: String,
  tweets: []
});

schema.methods.initFeed = function (socket) {
  socket.emit('tweet', {});
};

module.exports = mongoose.model('User', schema);
