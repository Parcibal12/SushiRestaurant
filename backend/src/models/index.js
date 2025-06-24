const sequelize = require('../config/db');
const User = require('./user');
const Category = require('./Category');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const BlogPost = require('./BlogPost');
const Reservation = require('./Reservation');
const Like = require('./Like');

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

User.hasMany(Like, { foreignKey: 'userId' });
Like.belongsTo(User, { foreignKey: 'userId' });

BlogPost.hasMany(Like, { foreignKey: 'blogPostId' });
Like.belongsTo(BlogPost, { foreignKey: 'blogPostId' });

const db = {
    sequelize,
    User,
    Category,
    Product,
    Order,
    OrderItem,
    BlogPost,
    Reservation,
    Like
};

module.exports = db;