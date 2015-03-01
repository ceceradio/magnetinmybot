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
        var self = this;
        function finder(numberOfWords) {
            if (numberOfWords == 0)
                return false;
            var regexStr = '(?=in my';
            for (var i = 0; i < numberOfWords; i++) {
                regexStr += " (\\w+)";
            }
            regexStr += ").";
            var regex = new RegExp(regexStr,"g");
            var potentialWords;
             
            while ((potentialWords = regex.exec(text)) != null) {
                if (potentialWords.index === regex.lastIndex) {
                    regex.lastIndex++;
                }
                if (potentialWords == null)
                    return finder(numberOfWords-1);
                var matchesGrammar = true;
                var constructedString = "";
                // words start at 1
                for (var i = 1; i <= numberOfWords; i++) {
                    constructedString += potentialWords[i];
                    if (i < numberOfWords)
                        constructedString += " ";
                    if ( (i < numberOfWords && !(potentialWords[i] in self.adjectives)) || (i == numberOfWords && !(potentialWords[i] in self.nouns))) {
                        matchesGrammar = false;
                        break;
                    }
                }
                if (matchesGrammar)
                    return constructedString;
            }
            
            return finder(numberOfWords-1);
        }
        return finder(4);
        
    }

if (typeof module !== "undefined") {
    module.exports = MagnetFinder;
}