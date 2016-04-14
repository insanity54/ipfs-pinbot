var path = require('path');
var Twitter = require('twitter');
var assert = require('chai').assert;
var _ = require("underscore");
var ninjas = require(path.join(__dirname, '..', 'ninjas.json'));
var ipfs = require(path.join(__dirname, 'ipfs'));


var consumer_key = process.env.TWITTER_CONSUMER_KEY;
var consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
var access_token_key = process.env.TWITTER_TOKEN_KEY;
var access_token_secret = process.env.TWITTER_ACCESS_TOKEN_SECRET;

assert.isDefined(ninjas);
assert.isDefined(consumer_key);
assert.isDefined(consumer_secret);
assert.isDefined(access_token_key);
assert.isDefined(access_token_secret);

var client = new Twitter({
    consumer_key: consumer_key,
    consumer_secret: consumer_secret,
    access_token_key: access_token_key,
    access_token_secret: access_token_secret
});



// listen for any tweets to @ipfsninja
client.stream('statuses/filter', {track: 'ipfsninja'}, function(stream) {
  stream.on('data', function(tweet) {
      
      console.log('got a mention- '+tweet.text+' from '+tweet.user.screen_name);
      
      // if tweet is from a ninja, pin!
      if (_.contains(ninjas, tweet.user.screen_name)) {
        console.log('tweet from ninja '+tweet.user.screen_name+'-- '+tweet.text);
        
        // see if there was an ipfs hash in the ninja's message
        ipfs.getHashes(tweet.text, function(err, hashes) {
            if (err) throw err;
            if (!hashes) {
                console.log('didnt get valid multihash');
                return reply(tweet.id, tweet.user.screen_name, 'you did not send me any valid multihash!');
            }
            // pin all the hashes!
            var z=0;
            for (var i=0; i<hashes.length; i++) {
                z+=1;
                ipfs.pin(hashes[i], function(err, res) {
                    if (err) throw err;
                    z-=1;
                    if (z==0) {
                        console.log('pinned '+hashes.length+' hashes.');
                        reply(tweet.id, tweet.user.screen_name, 'I pinned '+hashes.length+' hashes with my shuriken!');
                    }
                });
            }
            
        });
        

      }
  });
 
  stream.on('error', function(error) {
    throw error;
  });
});


/**
 * reply
 * 
 * reply to a twitter user
 * 
 * @param {Number} id - twitter id of the tweet we are replying to
 * @param {string} name - twitter username to reply to
 * @param {string} text - text to send to the user
 * @returns {boolean} - true if successful, false if not
 */
var reply = function(id, to, text) {
    
    if (typeof text === 'undefined' || typeof text === 'function')
        throw new Error('call it correctly! third param is the text to send to user');
    if (typeof to === 'undefined' || typeof to === 'function')
        throw new Error('call it correctly! second param is the twitter username to send it to!');
    
    // add @ if it's not at the start of the username to mention in the tweet
    if (!/^@/.test(to)) to = '@'+to;
    
    // add mention to text
    text = to+' '+text;
    
    // send!
    var updateOpts = {
        status: text,
        in_reply_to_status_id: id
    };
    client.post('statuses/update', updateOpts, function(err, tweet, response){
        if (err) throw err;
        console.log('tweet sent-- '+tweet.text);
    });
};