'use strict';

var User = require('mongoose').model('User');

module.exports = function (socket) {
  var user;
  
  socket.on('currentUser', function (currentUser) {
    user = User.findOne({_id: currentUser._id}, function (err, foundUser) {
      if (err || !foundUser) { 
        return socket.emit('errorMessage', {error: 'error finding currentUser'});
      }

      user = foundUser;
      user.initFeed(socket);
    });
  });

  socket.on('disconnect', function () {
    user = undefined;
  });
};
