export default (sequelize, DataTypes) => {
    const State = sequelize.define(
        'State',
        {
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
                    fields: ['country_id'],
                },
                {
                    fields: ['country_id', 'name'],
                },
            ],
        },
    );

    State.associate = (models) => {
        State.belongsTo(models.Country, {
            foreignKey: 'countryId',
            as: 'country',
        });
        State.hasMany(models.City, {
            foreignKey: 'stateId',
            as: 'cities',
        });
        State.hasMany(models.Company, {
            foreignKey: 'stateId',
            as: 'companies',
        });
        State.hasMany(models.Branch, {
            foreignKey: 'stateId',
            as: 'branches',
        });
        State.hasMany(models.Location, {
            foreignKey: 'stateId',
            as: 'locations',
        });
        State.hasMany(models.Employee, {
            foreignKey: 'stateId',
            as: 'employees',
        });
    };

    return State;
};