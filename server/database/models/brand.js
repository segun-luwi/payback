module.exports = (sequelize, DataTypes) => {
  const Brand = sequelize.define('Brand', {
    receiptId: DataTypes.INTEGER,
    brandName: DataTypes.STRING,
    qty: DataTypes.INTEGER,
    amount: DataTypes.DOUBLE,
    points: DataTypes.DOUBLE,
  }, {});
  Brand.associate = function(models) {
    // associations can be defined here
    Brand.belongsTo(models.Receipt, {
      foreignKey: 'receiptId',
      as: 'receipt',
      onDelete: 'CASCADE',
    });
  }
  return Brand;
};