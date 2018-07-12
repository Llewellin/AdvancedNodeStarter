const Buffer = require('safe-buffer').Buffer;
const Keygrip = require('keygrip');

const keys = require('../../config/keys');
const keygrip = new Keygrip([keys.cookieKey]);

module.exports = user => {
    const sessionObject = {
        passpord: {
            // user._id is a javascript object, so we need to parse it
            user: user._id.toString()
        }
    };
    // create the session
    const session = Buffer.from(JSON.stringify(sessionObject)).toString(
        'base64'
    );
    //create session.sig
    const sig = keygrip.sign('session=' + session);

    return {session, sig};
};
