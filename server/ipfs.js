var isIPFS = require('is-ipfs');
var ipfsAPI = require('ipfs-api');

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
    var matches = /Qm[A-Za-z0-9]{44}/.exec(string);
    if (matches) {
        // looks like an ipfs multihash
        if (isIPFS.multihash(matches)) return cb(null, matches); // is an ipfs multihash
        else return cb(null, null); // looked like a multihash, but was not valid
    }
    else return cb(null, null);
};
/**
 * @callback {onGotHashesCallback}
 * @param {error} err
 * @param {array} hashes - array of multihashes that were in teh string
 */


var pin = function pin(multihash, cb) {
    ipfs.add(multihash, {recursive: true}, function (err, res) {
       if (err) throw err;
       console.log(res);
       return cb(null, res);
    });
};


module.exports = {
    getHashes: getHashes,
    pin: pin
};