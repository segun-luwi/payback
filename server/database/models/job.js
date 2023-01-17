module.exports = (sequelize, DataTypes) => {
  const Job = sequelize.define('Job', {
    userId: DataTypes.INTEGER,
    token: DataTypes.STRING,
    code: DataTypes.INTEGER,
    duplicate: DataTypes.BOOLEAN,
    store: DataTypes.STRING,
    purchaseLocation: DataTypes.STRING,
    status: DataTypes.STRING,
  }, {});
  Job.associate = function(models) {
    // associations can be defined here
    Job.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
      onDelete: 'CASCADE',
    });
  }

  return Job;
};