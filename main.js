var config = require('./config.js');
var MagnetFinder = require('./MagnetFinder.js');
var magnetFinder = new MagnetFinder();
var twitter = require('twitter');
var fs = require('fs');
var twit = new twitter(config.twitter);


var badWords = {};
var tweetInterval = 2 * 60 * 1000;

loadBadwordDictionary(function(err) {
    magnetFinder.initializeDictionaries(function(err) {
        if (err) return;
        setInterval(function() {doTweet();}, tweetInterval);
        doTweet();
    });
});

function doTweet() {
    pickAMagnetLocation(function(err, magnetLocation) {
        if (err) {console.log("doTweet Error: "+err); return;}
        if (typeof magnetLocation === "undefined" || magnetLocation === false || magnetLocation === "") {
            console.log("No locations found"); return;
        }
        var tweetData = {status: "I put a magnet in my "+magnetLocation};
        twit.post('statuses/update', tweetData, function(error, body, response) {
            if(error) {console.log("doTweet Error:"); console.log(error); return;}
            magnetFinder.addUsedLocation(magnetLocation.toLowerCase());
            console.log("I put a magnet in my "+magnetLocation);
        });
    });
}


function findPotentialMagnetLocations(callback) {
    var data = {q:"in my", count: 100}
    fullTexts = [];
    twit.get('search/tweets', data, function(error, tweets, response){
        if(error) { console.log(error); callback(error); return; }
        if (tweets.statuses.length > 0) {
            for (var tweetIndex in tweets.statuses) {
                fullTexts.push(tweets.statuses[tweetIndex].text);
            }
        }
        callback(false, fullTexts);
    });
}
function pickAMagnetLocation(callback) {
    findPotentialMagnetLocations(function(err, texts) {
        if (err) { callback(err); return; }
        if (texts.length == 0) { console.log("No locations"); callback(true); return; }
        var magnetLocations = [];
        for (var i in texts) {
            var magnetLocation = magnetFinder.findWhereMyMagnetIs(texts[i]);
            if (magnetLocation !== false && !hasBadWords(magnetLocation)) {
                magnetLocations.push(magnetLocation);
            }
        }
        callback(false, magnetLocations[Math.floor(magnetLocations.length * Math.random())]);
    });
}
function loadBadwordDictionary(callback) {
    fs.readFile("stopwords.txt", 'utf-8', function(err,data) {
        if (err) {
            callback(err);
            return;
        }
        var stopwordsArray = data.split(/\s+/);
        for (var i=0;i<stopwordsArray.length;i++) {
            badWords[stopwordsArray[i]] = true;
        }
        callback(false);
    });
}
function hasBadWords(text) {
    var tokens = text.split(/\s+/);
    for (var i=0;i<tokens.length;i++) {
        if (tokens[i].toLowerCase() in badWords)
            return true;
    }
    return false;
}

