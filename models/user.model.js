const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Assuming your database connection is in the db.js file

const User = sequelize.define('User', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  age: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  address: {
    type: DataTypes.JSONB,
  },
});

User.create = async function (userData) {
  return this.build(userData).save();
};


module.exports = User;