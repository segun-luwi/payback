module.exports = (sequelize, DataTypes) => {
  const Pin = sequelize.define('Pin', {
    pin: DataTypes.STRING,
    points: DataTypes.DOUBLE,
    userId: DataTypes.INTEGER,
    store: DataTypes.STRING,
    status: DataTypes.STRING,
    dateUsed: DataTypes.DATE
  }, {});
  Pin.associate = function(models) {
    // associations can be defined here
    Pin.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    });
  }

  return Pin;
};