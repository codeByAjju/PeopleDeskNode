export default (sequelize, DataTypes) => {
    const City = sequelize.define(
        'City',
        {
            stateId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'states',
                    key: 'id',
                },
            },
            countryId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'countries',
                    key: 'id',
                },
            },
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
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
                    fields: ['state_id'],
                },
                {
                    fields: ['country_id'],
                },
                {
                    fields: ['state_id', 'name'],
                },
            ],
        },
    );

    City.associate = (models) => {
        City.belongsTo(models.State, {
            foreignKey: 'stateId',
            as: 'state',
        });
        City.belongsTo(models.Country, {
            foreignKey: 'countryId',
            as: 'country',
        });
        City.hasMany(models.Company, {
            foreignKey: 'cityId',
            as: 'companies',
        });
        City.hasMany(models.Branch, {
            foreignKey: 'cityId',
            as: 'branches',
        });
        City.hasMany(models.Location, {
            foreignKey: 'cityId',
            as: 'locations',
        });
        City.hasMany(models.Employee, {
            foreignKey: 'cityId',
            as: 'employees',
        });
    };

    return City;
};