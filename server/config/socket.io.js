'use strict';

var socketIo = require('socket.io'),
    io;

module.exports = function (config, server) {

  io = socketIo(server.listener);

  var ioHandler = function (socket) {
    // listen to user stream
    console.log(socket);
  };

  io.on('connection', ioHandler);

  return server;
};
