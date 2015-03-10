var MagnetFinder = require('../MagnetFinder.js');
var magnetFinder = new MagnetFinder();
var assert = require("assert")

describe('MagnetFinder', function() {
    var magnetFinder;
    before(function(done) {
        this.timeout(20000);
        magnetFinder = new MagnetFinder();
        magnetFinder.initializeDictionaries(function() {
            assert.notDeepEqual(magnetFinder.nouns, {});
            assert.notDeepEqual(magnetFinder.adjectives, {});
            assert.notDeepEqual(magnetFinder.compoundNounHashes, {});
            magnetFinder.usedLocations = {};
            done();
        });
    });
    describe("#spliceWordOutOfPhrase",function() { 
        it('Should return the remainder phrase beyond the given word',function() {
            assert.equal(magnetFinder.spliceWordOutOfPhrase("in my","in my car")," car");
        });
    });
    describe("#findWhereMyMagnetIs",function() { 
        it('Should return longer sentences before shorter ones', function() {
            assert.equal(magnetFinder.findWhereMyMagnetIs("in my cool smelly car"),"cool smelly car");
            assert.equal(magnetFinder.findWhereMyMagnetIs("yeah in my car in my cool nice car"),"cool nice car");
        });
        it('Should match two word nouns',function() {
            assert.equal(magnetFinder.findWhereMyMagnetIs("in my bulletin board"),"bulletin board");
        });
        it('Should trim extra "in my" phrases',function() {
            assert.equal(magnetFinder.findWhereMyMagnetIs("in my school's bulletin board in my"),"school's bulletin board");
            assert.equal(magnetFinder.findWhereMyMagnetIs("in my friend's dog's paw in my car"),"friend's dog's paw");
        });
        it('Should match possessive nouns and continue matching',function() {
            assert.equal(magnetFinder.findWhereMyMagnetIs("in my school's bulletin board"),"school's bulletin board");
            assert.equal(magnetFinder.findWhereMyMagnetIs("in my friend's dog's paw"),"friend's dog's paw");
        });
        it('Should not match trailing sentences',function() {
            assert.equal(magnetFinder.findWhereMyMagnetIs("in my school's abactinal"),"");
            assert.equal(magnetFinder.findWhereMyMagnetIs("in my dog'"),"");
        });
    });
    describe("#hasBadWords",function() {
        before(function() {
            magnetFinder.badWords["booty"] = true;
            assert.equal("booty" in magnetFinder.badWords, true);
        });
        it('Should return false if any bad words are found',function() {
            assert.equal(magnetFinder.hasBadWords("that's the booty huh?"),true);            
        });
        it('Should find bad words that are obfuscated with non-word characters',function() {
            assert.equal(magnetFinder.hasBadWords("that's the boo'ty, huh?"),true);
        });
    });
});