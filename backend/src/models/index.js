const sequelize = require('../config/db');
const User = require('./user');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

Category.hasMany(Product, {
    foreignKey: 'category_id'
});
Product.belongsTo(Category, {
    foreignKey: 'category_id'
});

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

const db = {
    sequelize,
    User,
    Category,
    Product,
    Order,
    OrderItem
};

module.exports = db;