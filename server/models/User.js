/*jshint camelcase: false */
'use strict';

var mongoose = require('mongoose'),
    schema;

var twitter = require('twitter'),
    Boom = require('boom');


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
  
  tweets: [{
    id_str:             String,
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

// don't store more than 4000 tweets
schema.pre('save', function (next) {
  if (this.tweets.length > 4000) {
    this.tweets = this.tweets.slice(0, 4000);
  }
  next();
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
    id_str:             rawTweet.id_str,
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
schema.methods.getAPIAuth = function () {
  var twit = new twitter({
    consumer_key: process.env.TWIT_KEY || 'empty',
    consumer_secret: process.env.TWIT_SECRET || 'empty',
    access_token_key: this.token,
    access_token_secret: this.secret
  });

  return twit;
};

schema.methods.initFeed = function (socket) {
  console.log('User: '+ this.displayName + ' connected');

  var twit = this.getAPIAuth();

  this.startFeed(twit, socket);

  try {
    this.listenToStream(twit, socket);
  } catch (e) {
    socket.emit('errorMessage', {error: 'error setting up stream', data: e});
  }
};

schema.methods.closeFeed = function () {
  console.log('User: '+ this.displayName +' disconnected');
  console.log(this.stream.destroy);

  if (!!this.stream) {
    this.stream.destroy();
    this.stream = undefined;
  }
};

schema.methods.listenToStream = function (twit, socket) {
  twit.stream('user', {}, function (stream) {
    this.stream = stream;

    stream.on('data', function (data) {
      if (filterPhotoTweets(data)) {
        var cleanedTweet = cleanTweet(data);

        this.tweets.unshift(cleanTweet);
        this.save();
        socket.emit('tweet', cleanedTweet);
      }
    }.bind(this));
  }.bind(this));
};

schema.methods.startFeed = function (twit, socket) {
  if (this.tweets.length > 0) {
    return socket.emit('tweets', this.tweets.slice(0, 20));
  }

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
    
    console.log('tweets found: ', data.length, ' tweets with pic: ', photoTweets.length);

    socket.emit('tweets', photoTweets.slice(0, 20));

    this.tweets   = this.tweets.concat(photoTweets);
    this.since_id = data[0].id_str;
    this.save();
  
  }.bind(this));
};

schema.methods.updateFeed = function (reply) {
  var twit = this.getAPIAuth();

  var query = {
    user_id: this.id,
    include_entities: true,
    count: 200,
    since_id: this.since_id
  };

  twit.get('/statuses/home_timeline.json', query, function (data, res) {
    if (res.statusCode !== 200) { return reply(Boom.badImplementation('bad twitter response in updateFeed')); }

    var photoTweets = data.filter(filterPhotoTweets).map(cleanTweet);
    
    console.log('tweets found: ', data.length, ' tweets with pic: ', photoTweets.length);

    this.since_id = data[0].id_str;
    this.max_id   = data[data.length-1].id_str;
    //this.tweets = this.tweets.concat(photoTweets);
    
    this.save(function () {
      reply(this.tweets.slice(0, 20));
    });

  }.bind(this));
};

schema.methods.paginateFeed = function (lastTweetId, reply) {
  var index = 0;
  this.tweets.forEach(function (e, i) {
    if (e.id_str === lastTweetId) { index = i; }
  });

  var nextSlice = this.tweets.slice(index+1, index+10);

  if (nextSlice.length > 0) {
    return reply(nextSlice);
  }

  // we need more tweets from the past
  var twit = this.getAPIAuth(),
      max_id = this.tweets[this.tweets.length-1].id_str;

  var query = {
    user_id: this.id,
    include_entities: true,
    count: 200,
    max_id: max_id
  };

  twit.get('/statuses/home_timeline.json', query, function (data, res) {
    if (res.statusCode !== 200) { return reply(Boom.badImplementation('bad twitter response in paginateFeed')); }

    data[0] = {}; // max_id duplicate
    var photoTweets = data.filter(filterPhotoTweets).map(cleanTweet);
    
    console.log('tweets found: ', data.length, ' tweets with pic: ', photoTweets.length);

    this.tweets = this.tweets.concat(photoTweets);
    this.save(function () {
      reply(this.tweets.slice(index+1, index+10));
    }.bind(this));
  
  }.bind(this));
};

module.exports = mongoose.model('User', schema);
