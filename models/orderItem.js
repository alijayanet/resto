const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  quantity: {
    type: DataTypes.FLOAT, // Float to support fractional weights (e.g., 1.5 Kg)
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  notes: {
    type: DataTypes.STRING,
    allowNull: true
  }
});

module.exports = OrderItem;
