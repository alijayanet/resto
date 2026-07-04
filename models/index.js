const sequelize = require('../config/database');
const User = require('./user');
const Menu = require('./menu');
const Order = require('./order');
const OrderItem = require('./orderItem');
const Setting = require('./setting');

// Associations
Order.hasMany(OrderItem, { as: 'items', foreignKey: 'orderId', onDelete: 'CASCADE' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Menu.hasMany(OrderItem, { foreignKey: 'menuId' });
OrderItem.belongsTo(Menu, { as: 'menu', foreignKey: 'menuId' });

module.exports = {
  sequelize,
  User,
  Menu,
  Order,
  OrderItem,
  Setting
};
