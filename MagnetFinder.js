var fs = require('fs');
var MagnetFinder = function () {
    this.nouns = {};
    this.adjectives = {};
    this.usedLocations = {};
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
    MagnetFinder.prototype.findWhereMyMagnetIs = function (text) {
        // i can make this recursive but i don't want to think about it right now
        var potentialNouns = text.match(/in my (\w+)/);
        if (potentialNouns !== null) {
            if (potentialNouns[1] in this.adjectives) {
                var potentialNouns2 = text.match(/in my (\w+) (\w+)/);
                if (potentialNouns2 !== null) {
                    if (potentialNouns2[2] in this.adjectives) {
                        var potentialNouns3 = text.match(/in my (\w+) (\w+) (\w+)/);
                        if (potentialNouns3 !== null) {
                            if (potentialNouns3[3] in this.nouns && !((potentialNouns3[1]+" "+potentialNouns3[2]+" "+potentialNouns3[3]).toLowerCase() in this.usedLocations))
                                return potentialNouns3[1]+" "+potentialNouns3[2]+" "+potentialNouns3[3];
                        }
                    }
                    if (potentialNouns2[2] in this.nouns && !((potentialNouns2[1]+" "+potentialNouns2[2]).toLowerCase() in this.usedLocations))
                        return potentialNouns2[1]+" "+potentialNouns2[2];
                }
            }
            if (potentialNouns[1] in this.nouns && !(potentialNouns[1].toLowerCase() in this.usedLocations)) {
                return potentialNouns[1];
            }
        }
        return false;
    }

if (typeof module !== "undefined") {
    module.exports = MagnetFinder;
}