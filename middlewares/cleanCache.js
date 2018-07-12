const {clearHash} = require('../services/cache');

// CRAZY: this middleware runs only AFTER the route handler
module.exports = async (req, res, next) => {
    // let the route handler to run first
    await next();

    clearHash(req.user.id);
};
