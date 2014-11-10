/*jshint camelcase: false */
'use strict';

var mongoose = require('mongoose'),
    schema;

var twitter = require('twitter');


schema = mongoose.Schema({  
  id: {
    type:  String,
    index: true
  },
  username:     String,
  displayName:  String,
  token:        String,
  secret:       String,
  
  tweets: [{
    profile_image_url:  String,
    text:               String,
    retweet_count:      Number,
    favorite_count:     Number
  }]
});

function cleanTweet (rawTweet) {
  return {
    profile_image_url:  rawTweet.user.profile_image_url,
    text:               rawTweet.text,
    retweet_count:      rawTweet.retweet_count  || 0,
    favorite_count:     rawTweet.favorite_count || 0
  };
}

function filterPhotoTweets (tweet) {
  var hasPhoto = false;

  tweet.extended_entities = tweet.extended_entities || {};
  tweet.extended_entities.media = tweet.extended_entities.media || [];

  tweet.extended_entities.media.forEach(function (entity) {
    if (entity.type === 'photo') {
      hasPhoto = true;
    }
  });

  return hasPhoto;
}


schema.methods.lookupOldTweets = function (socket) {
  var twit = new twitter({
      consumer_key: process.env.TWIT_KEY || 'empty',
      consumer_secret: process.env.TWIT_SECRET || 'empty',
      access_token_key: this.token,
      access_token_secret: this.secret
  });

  var query = {
    user_id: this.id,
    include_entities: true
  };

  twit.get('/statuses/user_timeline.json', query, function (data, res) {
    if (res.statusCode !== 200) { 
      return socket.emit('errorMessage', {error: 'error with /statuses/user_timeline.json'});
    }
    
    var photoTweets = data.filter(filterPhotoTweets);
    
    console.log('tweets found: ', data.length);
    console.log('tweets with pic: ', photoTweets.length);

    socket.emit('tweet', cleanTweet(photoTweets[0]));
  });
};


schema.methods.initFeed = function (socket) {
  if (this.tweets.length === 0) {
    this.lookupOldTweets(socket);
  }
};


module.exports = mongoose.model('User', schema);
