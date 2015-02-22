var config = require('./config.js');
var twitter = require('twitter');
var prompt = require('prompt');
var fs = require('fs');
var twit = new twitter(config.twitter);

var nouns = {};
var adjectives = {};
var badWords = {};
var usedLocations = {};
var tweetInterval = 2 * 60 * 1000;

loadUsedLocations(function(err) {
    loadDictionary(function(err) {
        if (err) return;
        loadBadwordDictionary(function(err) {
            if (err) return;
            setInterval(function() {doTweet();}, tweetInterval);
            doTweet();
        });
    });
});


function doTweet() {
    pickAMagnetLocation(function(err, magnetLocation) {
        var tweetData = {status: "I put a magnet in my "+magnetLocation};
        twit.post('statuses/update', tweetData, function(error, body, response) {
            if(error) {console.log("doTweet Error:"); console.log(error); return;}
            usedLocations[magnetLocation.toLowerCase()] = true;
            console.log("I put a magnet in my "+magnetLocation);
            saveUsedLocations(function() {console.log("Saved");});
        });
    });
}

// dictionary provided by http://icon.shef.ac.uk/Moby/mpos.html
function loadDictionary(callback) {
    fs.readFile("mobyposi.i", {encoding:"utf8"}, function(err, data) {
        if (err) {
            console.log(err); callback(err); return;
        }
        var lines = data.split("\r");
        for (var i in lines) {
            var parts = lines[i].split('�');
            if (parts.length < 2) {
                continue;
            }
            if (parts[1].indexOf("N") > -1)
                nouns[parts[0]] = true;
            else if (parts[1].indexOf("A") > -1)
                adjectives[parts[0]] = true;
        }
        callback(false);
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
function loadUsedLocations(callback) {
	fs.readFile("saveData.json", 'utf-8', function(err,data) {
		if (err) {
			callback(err);
			return;
		}
		usedLocations = JSON.parse(data);
        callback(false);
	});
}
function saveUsedLocations(callback) {
    fs.writeFile('saveData.json', JSON.stringify(usedLocations), {}, function(err) {
        if (err) { console.log(err); callback(err); return; }
        callback(false);
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
            var magnetLocation = findWhereMyMagnetIs(texts[i]);
            if (magnetLocation !== false && !hasBadWords(magnetLocation)) {
                magnetLocations.push(magnetLocation);
            }
        }
        callback(false, magnetLocations[Math.floor(magnetLocations.length * Math.random())]);
    });
}
function findWhereMyMagnetIs(text) {
    var potentialNouns = text.match(/in my (\w+)/);
    if (potentialNouns !== null) {
        if (potentialNouns[1] in adjectives) {
            potentialNouns2 = text.match(/in my (\w+) (\w+)/);
            if (potentialNouns2 !== null) {
                if (potentialNouns2[2] in nouns && !(potentialNouns2[1]+" "+potentialNouns2[2]).toLowerCase() in usedLocations)
                    return potentialNouns2[1]+" "+potentialNouns2[2];
            }
        }
        if (potentialNouns[1] in nouns && !(potentialNouns[1].toLowerCase() in usedLocations)) {
            return potentialNouns[1];
        }
    }
    return false;
}
function hasBadWords(text) {
    var tokens = text.split(/\s+/);
    for (var i=0;i<tokens.length;i++) {
        if (tokens[i].toLowerCase() in badWords)
            return true;
    }
    return false;
}

