module.exports = (sequelize, DataTypes) => {
  const Receipt = sequelize.define('Receipt', {
    userId: DataTypes.INTEGER,
    amount: DataTypes.DOUBLE,
    points: DataTypes.DOUBLE,
    store: DataTypes.STRING,
    purchaseLocation: DataTypes.STRING,
  }, {});
  Receipt.associate = function(models) {
    // associations can be defined here
    Receipt.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    });
  }

  return Receipt;
};