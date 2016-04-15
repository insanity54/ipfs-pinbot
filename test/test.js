var isIPFS = require('is-ipfs');
var ipfsAPI = require('ipfs-api');
var assert = require('chai').assert;
var myIPFS = require('../server/ipfs');


var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'});

var validHash   = 'QmfQ75DjAxYzxMP2hdm6o4wFwZS5t7uorEZ2pX9AKXEg2u';
var invalidHash = 'QmfQ5QAjvg4GA3wg3adpnDJug8kty1BxurVqzD8rtrVjM';
var contentlessHash = 'QmfQ75DjAxYzxMP2hdm6o4wFwZS5t7ubrEZ2pX9AKXEg2u';
//                 QmfQ5QAjvg4GtA3wg3adpnDJug8ktA1BxurVqBD8rtgVjM
//                 QmfQ5QAjvg4GtA3wg3adpnDJug8kty1BxurVqzD8rtrVjM

describe('pin add', function() {
    
    it('should pin recursively successfully', function(done) {
        ipfs.pin.add(validHash, {recursive: true}, function (err, res) {
            assert.isNull(err);
            assert.equal(res.Pins.length, 1)
            done();
        }); 
    });
});


describe('hash validation', function() {
   it('should callback w error when receiving an invalid multihash', function(done) {
       myIPFS.validateHashes([validHash, invalidHash], function(err, validHashes) {
           assert.isObject(err);
           //console.log(err);
           assert.equal(err.invalid, invalidHash);
           done();
       });
   });
});


