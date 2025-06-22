const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = function(req, res, next) {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'No hay token, autorización denegada.' });
    }

    const tokenParts = token.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
        return res.status(401).json({ message: 'Formato de token inválido.' });
    }

    const actualToken = tokenParts[1];

    try {
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);


        req.user = decoded.user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'El token no es válido.' });
    }
};