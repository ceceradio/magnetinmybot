var fs = require('fs');
var MagnetFinder = function () {
    this.nouns = {};
    this.adjectives = {};
    this.usedLocations = {};
    this.compoundNounHashes = {};
}
// dictionary provided by http://icon.shef.ac.uk/Moby/mpos.html
MagnetFinder.prototype.loadDictionary = function(callback) {
    var self = this;
    fs.readFile("mobyposi.i", {encoding:"utf8"}, function(err, data) {
        if (err) {
            console.log(err); callback(err); return;
        }
        var lines = data.split("\r");
        for (var i in lines) {
            var parts = lines[i].split(/[\uFFFC-\uFFFD]/);
            if (parts.length < 2) {
                continue;
            }
            if (parts[1].indexOf("A") > -1)
                self.adjectives[parts[0]] = true;
            if (parts[1].indexOf("N") > -1)
                self.nouns[parts[0]] = true;
            if (parts[1].indexOf("h") > -1)
                self.compoundNounHashes[parts[0]] = true;
        }
        callback(false);
    });
}
MagnetFinder.prototype.initializeDictionaries = function(callback) {
    var self = this;
    this.loadUsedLocations(function(err) {
        self.loadDictionary(function(err) {
            if (err) { callback(err); return; }
            callback(false);
        });
    });
}

MagnetFinder.prototype.loadUsedLocations = function (callback) {
    var self = this;
    fs.readFile("saveData.json", 'utf-8', function(err,data) {
        if (err) {
            callback(err);
            return;
        }
        self.usedLocations = JSON.parse(data);
        callback(false);
    });
}
MagnetFinder.prototype.addUsedLocation = function(location) {
    this.usedLocations[location] = true;
    this.saveUsedLocations(function(err){
        if (err) {console.log(err);return;}
        console.log("Saved");
    });
}
MagnetFinder.prototype.saveUsedLocations = function (callback) {
    fs.writeFile('saveData.json', JSON.stringify(this.usedLocations), {}, function(err) {
        if (err) { console.log(err); callback(err); return; }
        callback(false);
    });
}
MagnetFinder.prototype.findAdjective = function (phrase) {
    var word = phrase.match(/^\s*([\w\-]+)/);
    if (word == null)
        return false;
    word = word[1];
    if (word in this.adjectives)
        return word;
    return false;
}
MagnetFinder.prototype.findNoun = function(phrase) {
    var word = phrase.match(/^\s*([\w\-]+)/);
    if (word == null)
        return false;
    word = word[1];
    if (word in this.nouns)
        return word;
    return false;
}
MagnetFinder.prototype.findPossessiveNoun = function(phrase) {
    var word = phrase.match(/^\s*([\w\-]+'s?)/);
    if (word == null)
        return false;
    word = word[1];
    var nounOnly = word.match(/([\w\-]+)/)[1];
    if (nounOnly in this.nouns)
        return word;
    return false;
}
MagnetFinder.prototype.findCompoundNoun = function(phrase) {
    var word = phrase.match(/^\s*([\w\-]+\s[\w\-]+)/);
    if (word == null)
        return false;
    word = word[1];
    if (word in this.compoundNounHashes)
        return word;
    return false;
}
MagnetFinder.prototype.findPossessiveCompoundNoun = function(phrase) {
    var word = phrase.match(/^\s*([\w\-]+\s[\w\-]+'s?)/);
    if (word == null)
        return false;
    word = word[1];
    var nounOnly = phrase.match(/^\s*([\w\-]+\s[\w\-]+)/)[1];
    if (nounOnly in this.compoundNounHashes)
        return word;
    return false;
}
MagnetFinder.prototype.spliceWordOutOfPhrase = function(word, phrase) {
    return phrase.slice(phrase.indexOf(word)+word.length);
}
// SSF = string so far
MagnetFinder.prototype.parsePhrase = function(SSF, phrase) {
    if (typeof phrase === "undefined" || phrase == "")
        return "";
    var word;
    if ((word = this.findPossessiveCompoundNoun(phrase)) !== false) {
        SSF = SSF + " " + word;
        return this.parsePhrase(SSF, this.spliceWordOutOfPhrase(word, phrase));
    }
    if ((word = this.findPossessiveNoun(phrase)) !== false) {
        SSF = SSF + " " + word;
        return this.parsePhrase(SSF, this.spliceWordOutOfPhrase(word, phrase));
    }
    if ((word = this.findAdjective(phrase)) !== false) {
        SSF = SSF + " " + word;
        return this.parsePhrase(SSF, this.spliceWordOutOfPhrase(word, phrase));
    }
    if ((word = this.findCompoundNoun(phrase)) !== false) {
        SSF = SSF + " " + word;
        return SSF;
    }
    if ((word = this.findNoun(phrase)) !== false) {
        SSF = SSF + " " + word;
        return SSF;
    }
    return "";
}
MagnetFinder.prototype.findWhereMyMagnetIs = function (text) {
    var self = this;
    var regexToFindWholeStrings = /(?=in my ([\w'\-]+(?:\s+[\w'\-]+)*))./g;
    var trimEnd = /([\w+\s+\-']+)\s+in my\s*/;
    var potentialPhrases;
    
    var bestResult = "";
    while ((potentialPhrases = regexToFindWholeStrings.exec(text)) != null) {
        if (potentialPhrases.index === regexToFindWholeStrings.lastIndex) {
            regexToFindWholeStrings.lastIndex++;
        }
        if (potentialPhrases[1].indexOf("in my") > -1) {
            var trimResult = potentialPhrases[1].match(trimEnd);
            if (trimResult != null)
                potentialPhrases[1] = trimResult[1];
        }
        var result = self.parsePhrase("", potentialPhrases[1]);
        if (result !== false && result.length > bestResult.length && !(result.toLowerCase().trim() in self.usedLocations)) {
            bestResult = result.trim();
        }
    }
    if (bestResult != "")
        return bestResult.trim();
    return false;
}

if (typeof module !== "undefined") {
    module.exports = MagnetFinder;
}