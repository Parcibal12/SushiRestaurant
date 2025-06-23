const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const BlogPost = sequelize.define('BlogPost', {
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT,
        allowNull: false
    },

    imageUrl: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

module.exports = BlogPost;