var config = require('./config.js');
var twitter = require('twitter');
var fs = require('fs');
var twit = new twitter(config.twitter);

// nothing yet
var data = {q:"in my"}
twit.get('search/tweets', data, function(error, tweets, response){
    if(error) { console.log("Error:"); console.log(error); return; }
    if (tweets.statuses.length > 0) {
        for (var tweetIndex in tweets.statuses) {
            var tweet = tweets.statuses[tweetIndex];
            console.log(tweet.text.match(/in my (\w)+/g));
            
        }
    }
    else
        console.log("No tweets found.");
});