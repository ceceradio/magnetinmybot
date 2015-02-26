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
});