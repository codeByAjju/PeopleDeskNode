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

      countryId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'countries',
          key: 'id',
        },
      },

      stateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'states',
          key: 'id',
        },
      },

      cityId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'cities',
          key: 'id',
        },
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
      indexes: [
        {
          fields: ['country_id'],
        },
        {
          fields: ['state_id'],
        },
        {
          fields: ['city_id'],
        },
      ],
    },
  );

  Branch.associate = (models) => {
    Branch.belongsTo(models.Country, {
      foreignKey: 'countryId',
      as: 'country',
    });

    Branch.belongsTo(models.State, {
      foreignKey: 'stateId',
      as: 'state',
    });

    Branch.belongsTo(models.City, {
      foreignKey: 'cityId',
      as: 'city',
    });

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