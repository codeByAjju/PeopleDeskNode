/* eslint-disable no-param-reassign */

export default (sequelize, DataTypes) => {
  const Location = sequelize.define(
    'Location',
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

      branchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'branches',
          key: 'id',
        },
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

      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },

      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },

      radiusInMeters: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 500,
        comment: 'Geofence radius in meters',
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
          fields: ['branch_id'],
        },
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

  Location.associate = (models) => {
    Location.belongsTo(models.Branch, {
      foreignKey: 'branchId',
      as: 'branch',
    });

    Location.belongsTo(models.Country, {
      foreignKey: 'countryId',
      as: 'country',
    });

    Location.belongsTo(models.State, {
      foreignKey: 'stateId',
      as: 'state',
    });

    Location.belongsTo(models.City, {
      foreignKey: 'cityId',
      as: 'city',
    });

    Location.hasMany(models.Employee, {
      foreignKey: 'locationId',
      as: 'employees',
    });
    Location.hasMany(models.Attendance, {
      foreignKey: 'locationId',
      as: 'attendances',
    });
  };

  return Location;
};