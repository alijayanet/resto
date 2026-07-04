const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Menu = sequelize.define('Menu', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  priceType: {
    type: DataTypes.ENUM('kg', 'pcs'),
    allowNull: false,
    defaultValue: 'pcs'
  },
  image: {
    type: DataTypes.STRING,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'lainnya'
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  }
});

module.exports = Menu;
