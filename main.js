var config = require('./config.js');
var twitter = require('twitter');
var prompt = require('prompt');
var fs = require('fs');
var twit = new twitter(config.twitter);

var nouns = {};
var adjectives = {};
var badWords = {};

// dictionary provided by http://icon.shef.ac.uk/Moby/mpos.html
fs.readFile("mobyposi.i", {encoding:"utf8"}, function(err, data) {
    if (err) {
        console.log(err); return;
    }
    var lines = data.split("\r");
    for (var i in lines) {
        var parts = lines[i].split('�');
        if (parts.length < 2) {
            console.log(parts); continue;
        }
        if (parts[1].indexOf("N") > -1)
            nouns[parts[0]] = true;
        else if (parts[1].indexOf("A") > -1)
            adjectives[parts[0]] = true;
    }
    findWhereMyMagnetIs("there's a magnet in my smelly ass");
    //console.log(nouns);
});
/*
var data = {q:"in my"}
twit.get('search/tweets', data, function(error, tweets, response){
    if(error) { console.log("Error:"); console.log(error); return; }
    if (tweets.statuses.length > 0) {
        for (var tweetIndex in tweets.statuses) {
            var tweet = tweets.statuses[tweetIndex];
            findWhereMyMagnetIs(tweet.text);
        }
    }
    else
        console.log("No tweets found.");
});
*/
function findWhereMyMagnetIs(text) {
    var potentialNouns = text.match(/in my (\w+)/);
    if (potentialNouns !== null) {
        if (potentialNouns[1] in nouns)
            console.log("Magnet in my "+potentialNouns[1]);
        else if (potentialNouns[1] in adjectives) {
            potentialNouns = text.match(/in my (\w+) (\w+)/);
            if (potentialNouns !== null) {
                if (potentialNouns[2] in nouns)
                    console.log("Magnet in my "+potentialNouns[1]+" "+potentialNouns[2]);
            }
        }
    }
}
function hasBadWords(text) {
    var tokens = text.split(/\s+/);
    for (var i=0;i<tokens.length;i++) {
        if (tokens[i].toLowerCase() in badWords)
            return true;
    }
    return false;
}
function loadBadwordDictionary(callback) {
	var filePath = path.join(__dirname, 'stopwords.txt');
	fs.readFile(filePath, 'utf-8', function(err,data) {
		if (err) {
			callback(err);
			return;
		}
		var stopwordsArray = data.split(/\s+/);
		for (var i=0;i<stopwordsArray.length;i++) {
			badWords[stopwordsArray[i]] = true;
		}
	});
}
