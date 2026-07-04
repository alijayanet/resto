const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../resto.sqlite'),
  logging: false // set to console.log to see SQL queries
});

module.exports = sequelize;
