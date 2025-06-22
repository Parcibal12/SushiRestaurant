const sequelize = require('../config/db');
const User = require('./user');
const Category = require('./Category');
const Product = require('./Product');

Category.hasMany(Product, {
    foreignKey: 'category_id'
});
Product.belongsTo(Category, {
    foreignKey: 'category_id'
});

const db = {
    sequelize,
    User,
    Category,
    Product
};

module.exports = db;