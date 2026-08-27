export default (sequelize, DataTypes) => {
  const Company = sequelize.define(
    'Company',
    {
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },

      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },

      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },

      phoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      website: {
        type: DataTypes.STRING(255),
        allowNull: true,
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

      logo: {
        type: DataTypes.STRING(255),
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

  Company.associate = (models) => {
    Company.belongsTo(models.Country, {
      foreignKey: 'countryId',
      as: 'country',
    });
    Company.belongsTo(models.State, {
      foreignKey: 'stateId',
      as: 'state',
    });
    Company.belongsTo(models.City, {
      foreignKey: 'cityId',
      as: 'city',
    });
  };

  return Company;
};