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
            // this is failing right now
            assert.equal(magnetFinder.findWhereMyMagnetIs("in my bulletin board"),"bulletin board");
        });
        it('Should match possessive nouns and continue matching',function() {
            // this is failing right now
            assert.equal(magnetFinder.findWhereMyMagnetIs("in my school's bulletin board"),"school's bulletin board");
            assert.equal(magnetFinder.findWhereMyMagnetIs("in my friend's dog's paw"),"friend's dog's paw");
        });
    });
});