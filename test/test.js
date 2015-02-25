var MagnetFinder = require('../MagnetFinder.js');
var magnetFinder = new MagnetFinder();
var assert = require("assert")

describe('MagnetFinder', function() {
    describe('#MagnetFinder()',function() {
        it('Create a new MagnetFinder object', function() {
            assert.deepEqual(typeof new MagnetFinder(), "object");
        });
    });
});