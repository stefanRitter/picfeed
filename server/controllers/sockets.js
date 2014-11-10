'use strict';

var User = require('mongoose').model('User');

module.exports = function (socket) {
  var user;
  
  socket.on('currentUser', function (currentUser) {
    user = User.findOne({_id: currentUser._id}, function (err, foundUser) {
      if (err || !foundUser) { 
        return socket.emit('error', {error: 'error finding currentUser'});
      }

      user = foundUser;
      socket.emit('tweet', {});
    });
  });

};
