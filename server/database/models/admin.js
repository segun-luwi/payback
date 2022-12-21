module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    gender: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    forgotToken: DataTypes.STRING,
    forgotTokenExpiry: DataTypes.DATE,
    roleId: DataTypes.INTEGER,
    status: DataTypes.STRING,
  }, {});
  Admin.associate = function(models) {
    // associations can be defined here
  }
  return Admin;
};