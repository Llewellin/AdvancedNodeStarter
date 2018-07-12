const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = () => {
    //return a Promise
    return new User({}).save();
};
