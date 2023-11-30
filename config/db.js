const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  database: 'postgres',
  username: 'postgres',
  password: 'root',
  host: '127.0.0.1',
  port: 5432,
  dialect: 'postgres',
  logging: false,
});

module.exports = sequelize;