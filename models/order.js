const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  customerName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tableNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  type: {
    type: DataTypes.ENUM('dine-in', 'delivery'),
    allowNull: false,
    defaultValue: 'dine-in'
  },
  totalPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'paid'),
    allowNull: false,
    defaultValue: 'pending'
  }
});

module.exports = Order;
