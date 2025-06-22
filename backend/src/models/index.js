const sequelize = require('../config/db');
const User = require('./user');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const BlogPost = require('./BlogPost');
const Reservation = require('./Reservation');

Category.hasMany(Product, {
    foreignKey: 'category_id'
});
Product.belongsTo(Category, {
    foreignKey: 'category_id'
});

User.hasMany(Order, { foreignKey: 'userId' });
Order.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(BlogPost, { foreignKey: 'authorId' });
BlogPost.belongsTo(User, { as: 'author', foreignKey: 'authorId' });

const db = {
    sequelize,
    User,
    Category,
    Product,
    Order,
    OrderItem,
    BlogPost,
    Reservation
};

module.exports = db;