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
  secret: String
});

module.exports = mongoose.model('User', schema);
