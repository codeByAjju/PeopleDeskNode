export default (sequelize, DataTypes) => {
    const Country = sequelize.define(
        'Country',
        {
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },
            isoCode: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
            phoneCode: {
                type: DataTypes.STRING(10),
                allowNull: false,
            },
            currencySymbol: {
                type: DataTypes.STRING(10),
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
                    unique: true,
                    fields: ['iso_code'],
                },
                {
                    fields: ['name'],
                },
            ],
        },
    );

    Country.associate = (models) => {
        Country.hasMany(models.State, {
            foreignKey: 'countryId',
            as: 'states',
        });
        Country.hasMany(models.City, {
            foreignKey: 'countryId',
            as: 'cities',
        });
        Country.hasMany(models.Company, {
            foreignKey: 'countryId',
            as: 'companies',
        });
        Country.hasMany(models.Branch, {
            foreignKey: 'countryId',
            as: 'branches',
        });
        Country.hasMany(models.Location, {
            foreignKey: 'countryId',
            as: 'locations',
        });
        Country.hasMany(models.Employee, {
            foreignKey: 'countryId',
            as: 'employees',
        });
    };

    return Country;
};