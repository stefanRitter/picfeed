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

  since_id:     String,
  max_id:       String,
  
  tweets: [{
    created_at:         String,
    url:                String,
    profile_image_url:  String,
    text:               String,
    retweet_count:      Number,
    favorite_count:     Number,
    pics:               [String]
  }],

  stream: mongoose.Schema.Types.Mixed
});

// helpers
function cleanTweet (rawTweet) {
  var pics = rawTweet.extended_entities.media.map(function (e) {
              if (e.type === 'photo') { return e.media_url; }
             });

  var profile_image_url = rawTweet.user.profile_image_url;
  if (!!rawTweet.retweeted_status) {
    profile_image_url = rawTweet.retweeted_status.user.profile_image_url;
  }

  return {
    created_at:         rawTweet.created_at,
    url:                'http://twitter.com/'+rawTweet.user.id_str+'/status/'+rawTweet.id_str,
    profile_image_url:  profile_image_url,
    text:               rawTweet.text,
    retweet_count:      rawTweet.retweet_count  || 0,
    favorite_count:     rawTweet.favorite_count || 0,
    pics:               pics
  };
}

function filterPhotoTweets (tweet) {
  var hasPhoto = false;

  tweet.extended_entities = tweet.extended_entities || {};
  tweet.extended_entities.media = tweet.extended_entities.media || [];
  tweet.extended_entities.media.forEach(function (entity) {
    if (entity.type === 'photo') { hasPhoto = true; }
  });

  return hasPhoto;
}



// Twitter API calls
schema.methods.loadTimeline = function (twit, socket) {
  var query = {
    user_id: this.id,
    include_entities: true,
    count: 200 // maximum
  };

  twit.get('/statuses/user_timeline.json', query, function (data, res) {
    if (res.statusCode !== 200) { 
      return socket.emit('errorMessage', {error: 'error with /statuses/user_timeline.json'});
    }
    
    this.since_id = data[0].id_str;
    this.max_id   = data[data.length-1].id_str;

    var photoTweets = data.filter(filterPhotoTweets).map(cleanTweet);
    
    console.log('tweets found: ', data.length);
    console.log('tweets with pic: ', photoTweets.length);

    this.tweets = this.tweets.concat(photoTweets);
    this.save();
  }.bind(this));
};

schema.methods.initHomeFeed = function (twit, socket) {
  var query = {
    user_id: this.id,
    include_entities: true,
    count: 200
  };

  twit.get('/statuses/home_timeline.json', query, function (data, res) {
    if (res.statusCode !== 200) { 
      return socket.emit('errorMessage', {error: 'error with /statuses/home_timeline.json'});
    }
    
    var photoTweets = data.filter(filterPhotoTweets).map(cleanTweet);
    
    console.log('tweets found: ', data.length);
    console.log('tweets with pic: ', photoTweets.length);

    socket.emit('tweets', photoTweets);
  });
};

schema.methods.listenToHomeStream = function (twit, socket) {
  twit.stream('user', {}, function (stream) {
    this.stream = stream;

    stream.on('data', function (data) {
      if (filterPhotoTweets(data)) {
        socket.emit('tweet', cleanTweet(data));
      }
    });
  }.bind(this));
};


schema.methods.initFeed = function (socket) {
  console.log('User: '+ this.displayName + ' connecting');
  
  var twit = new twitter({
      consumer_key: process.env.TWIT_KEY || 'empty',
      consumer_secret: process.env.TWIT_SECRET || 'empty',
      access_token_key: this.token,
      access_token_secret: this.secret
  });

  this.initHomeFeed(twit, socket);
  this.listenToHomeStream(twit, socket);
};

schema.methods.closeFeed = function () {
  console.log('User: '+ this.displayName + ' disconnected');
  
  if (!!this.stream) {
    this.stream.destroy();
    this.stream = undefined;
  }
};

module.exports = mongoose.model('User', schema);
