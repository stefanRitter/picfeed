'use strict';

var socketIo = require('socket.io'),
    io;

module.exports = function (config, server) {

  io = socketIo(server.listener);

  var ioHandler = function (socket) {

    socket.on('currentUser', function (currentUser) {
      console.log(currentUser);
      socket.emit('pong', currentUser);
    });

  };

  io.on('connection', ioHandler);

  return server;
};
