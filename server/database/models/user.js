module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: DataTypes.STRING,
    lcda: DataTypes.STRING,
    lga: DataTypes.STRING,
    state: DataTypes.STRING,
    age: DataTypes.INTEGER,
    maritalStatus: DataTypes.STRING,
    gender: DataTypes.STRING,
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    forgotToken: DataTypes.STRING,
    forgotTokenExpiry: DataTypes.DATE,
    roleId: DataTypes.INTEGER,
    status: DataTypes.STRING,
  }, {});
  User.associate = function(models) {
    // associations can be defined here
    User.hasOne(models.Point, {
      foreignKey: 'userId',
      as: 'points',
      onDelete: 'CASCADE',
    });
  }
  return User;
};