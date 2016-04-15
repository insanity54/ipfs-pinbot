var isIPFS = require('is-ipfs');
var ipfsAPI = require('ipfs-api');
var _ = require('underscore');

var ipfs = ipfsAPI('localhost', '5001', {protocol: 'http'});



/**
 * getHashes
 * 
 * retrieve any IPFS multihashes from a string
 * calls back with (err=null, hashes=null) if no valid multihashes exist in string
 * 
 * @param {string} string - the text message received from ninja
 * @param {onGotHashesCallback} cb
 */
var getHashes = function getHashes(string, cb) {
    var hashRe = /Qm[A-Za-z0-9]{44}/g;

    var hashes = [];
    var match = [];
    while ((match = hashRe.exec(string)) !== null) {
        // looks like an ipfs multihash
        hashes.push(match[0]); // is an ipfs multihash
    }
    
    //console.log(hashes);
    return cb(null, hashes);
};
/**
 * @callback {onGotHashesCallback}
 * @param {error} err
 * @param {array} hashes - array of multihashes that were in teh string
 */




/**
 * validateHashes
 * 
 * calls back with array of valid hashes
 * calls back with error if any hash is invalid
 * 
 * @param {array} hashes 
 * @param {onValidatedHashesCallback} cb
 */
var validateHashes = function validateHashes(hashes, cb) {
    var invalid = _.find(hashes, function(hash) {
        return (!isIPFS.multihash(hash));
    });
    if (invalid)
        return cb({invalid: invalid, msg: "invalid hash was found"}, null);
    return cb(null, hashes);
};
/**
 * @callback {onValidatedHashesCallback}
 * @param {object} err
 * @param {string} err.invalid - the invalid hash
 * @param {string} err.msg - error message
 * @param {array} validHashes
 */
 
 
 

 


/**
 * pin
 * 
 * pin a multihash
 * 
 * @param {string} multihash
 * @param {onPinnedCallback} cb
 */
var pin = function pin(multihash, cb) {
    ipfs.pin.add(multihash, {recursive: true, timeout: '15m'}, function (err, res) {
       if (err) return cb(err, 0);
       var numPins = res.Pins.length || 0;
       return cb(null, numPins);
    });
};
/**
 * @callback {onPinnedCallback}
 * @param {error} err
 * @param {number} numPins - number of pins that succeeded in pinning
 */


module.exports = {
    getHashes: getHashes,
    pin: pin,
    validateHashes: validateHashes
};