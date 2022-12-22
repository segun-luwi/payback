module.exports = (sequelize, DataTypes) => {
  const UserSignIn = sequelize.define('UserSignIn', {
    userId: DataTypes.INTEGER,
    date: DataTypes.DATE,
  }, {});
  UserSignIn.associate = function(models) {
    // associations can be defined here
    UserSignIn.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    });
  }

  return UserSignIn;
};