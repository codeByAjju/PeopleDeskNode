/* eslint-disable no-param-reassign */

export default (sequelize, DataTypes) => {
  const Designation = sequelize.define(
    'Designation',
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      level: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM('active', 'inactive', 'deleted'),
        defaultValue: 'active',
      },
    },
    {
      underscored: true,
    },
  );

  Designation.associate = (models) => {
    Designation.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department',
    });

    Designation.hasMany(models.Employee, {
      foreignKey: 'designationId',
      as: 'employees',
    });
  };

  return Designation;
};