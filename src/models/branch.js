/* eslint-disable no-param-reassign */

export default (sequelize, DataTypes) => {
  const Branch = sequelize.define(
    'Branch',
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

      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      city: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      state: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      country: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      postalCode: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      phoneNumber: {
        type: DataTypes.STRING(20),
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

  Branch.associate = (models) => {
    Branch.hasMany(models.Location, {
      foreignKey: 'branchId',
      as: 'locations',
    });

    Branch.hasMany(models.Employee, {
      foreignKey: 'branchId',
      as: 'employees',
    });
  };

  return Branch;
};