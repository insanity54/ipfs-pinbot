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
                console.log('didnt get any multihash');
                return reply(tweet.id_str, tweet.user.screen_name, "you didn't send me any multihashes!");
            }
            
            // validate hashes
            ipfs.validateHashes(hashes, function(err, hashes) {
                if (err) {
                    console.log('invalid hash');
                    return reply(tweet.id_str, tweet.usr.screen_name, err.invalid+" is an invalid mutlihash!");
                }
                
                // pin all the hashes!
                var c=0;
                var msg=[];
                var pinned=0;
                for (var i=0; i<hashes.length; i++) {
                    c+=1;
                    reply(tweet.id_str, tweet.user.screen_name, "recursive pin of "+hashes[i]+" in progress! I will try for 15 mins.");
                    console.log('pinning '+i+' of '+hashes.length+' -- '+hashes[i]);
                    ipfs.pin(hashes[i], function(err, numPins) {
                        if (err) {
                            console.log(err);
                            msg.push(err);
                        }
                        else pinned+=1;
                        //console.log('pin seems fine! --'+res);
                        c-=1;
                        if (c==0) {
                            if (pinned) msg.push(pinned+' pinned hashes with my shuriken!.')
                            if (!pinned) msg.push('I failed!');
                            console.log(msg.join('/'));
                            reply(tweet.id_str, tweet.user.screen_name, msg.join('/'));
                        }
                    });
                }
            });
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
        //console.log(tweet);
    });
};