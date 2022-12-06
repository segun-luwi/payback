module.exports = (sequelize, DataTypes) => {
  const Point = sequelize.define('Point', {
    userId: DataTypes.INTEGER,
    store: DataTypes.STRING,
    points: DataTypes.DOUBLE
  }, {});
  Point.associate = function(models) {
    // associations can be defined here
    Point.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    });
  }

  return Point;
};