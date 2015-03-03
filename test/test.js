var MagnetFinder = require('../MagnetFinder.js');
var magnetFinder = new MagnetFinder();
var assert = require("assert")

describe('MagnetFinder', function() {
    describe('#MagnetFinder()',function() {
        it('Create a new MagnetFinder object', function() {
            assert.deepEqual(typeof new MagnetFinder(), "object");
        });
    });
    describe("#initializeDictionaries",function() {
        it('Should fill the nouns and adjectives objects', function(done) {
            this.timeout(20000);
            var magnetFinder = new MagnetFinder();
            magnetFinder.initializeDictionaries(function() {
                assert.notDeepEqual(magnetFinder.nouns, {});
                assert.notDeepEqual(magnetFinder.adjectives, {});
                done();
            });
        });       
    });
    describe("#findWhereMyMagnetIs",function() {
        var magnetFinder;
        before(function(done) {
            this.timeout(20000);
            magnetFinder = new MagnetFinder();
            magnetFinder.initializeDictionaries(function() {
                assert.notDeepEqual(magnetFinder.nouns, {});
                assert.notDeepEqual(magnetFinder.adjectives, {});
                magnetFinder.usedLocations = {};
                done();
            });
        });
        it('Should return longer sentences before shorter ones', function() {
            assert.equal(magnetFinder.findWhereMyMagnetIs("in my cool smelly car"),"cool smelly car");
            assert.equal(magnetFinder.findWhereMyMagnetIs("yeah in my car in my cool nice car"),"cool nice car");
        });
        it('Should match two word nouns',function() {
            // this is failing right now
            assert.equal(magnetFinder.findWhereMyMagnetIs("in my bulletin board"),"bulletin board");
        });
        it('Should match possessive nouns and continue reading',function() {
            // this is failing right now
            assert.equal(magnetFinder.findWhereMyMagnetIs("in my school's bulletin board"),"school's bulletin board");
        });
    });
});