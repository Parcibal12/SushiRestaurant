const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Reservation = sequelize.define('Reservation', {
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    contact_info: {
        type: DataTypes.STRING,
        allowNull: false
    },
    reservation_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    guest_count: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
        userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'Users',
            key: 'id'
        }
    }

    
});

module.exports = Reservation;