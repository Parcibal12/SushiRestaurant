const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
    const tokenHeader = req.header('Authorization');
    if (!tokenHeader) {
        return next();
    }

    try {
        const token = tokenHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (error) {

        next();
    }
};