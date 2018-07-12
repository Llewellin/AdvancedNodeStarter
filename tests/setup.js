jest.setTimeout(5000);

require('../models/User');

const mongoose = require('mongoose');
const keys = require('../config/keys');

// Tell mongoose to use node Promise implementation
mongoose.Promise = global.Promise;
mongoose.connect(
    keys.mongoURI,
    {userMongoClient: true}
);
