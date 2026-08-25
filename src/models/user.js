/* eslint-disable no-param-reassign */

export default (sequelize, DataTypes) => {
    const User = sequelize.define(
        'User',
        {
            firstName: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },

            lastName: {
                type: DataTypes.STRING(50),
                allowNull: false,
            },

            email: {
                type: DataTypes.STRING(100),
                allowNull: false,
                unique: true,
            },

            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },

            role: {
                type: DataTypes.ENUM(
                    'super_admin',
                    'admin',
                    'hr_manager',
                    'manager',
                    'employee',
                    'user'
                ),
                allowNull: false,
            },

            token: {
                type: DataTypes.STRING(255),
                allowNull: true,
                defaultValue: null,
            },

            status: {
                type: DataTypes.ENUM('active', 'inactive', 'deleted'),
                allowNull: false,
                defaultValue: 'active',
            },

            profileImageURL: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },

            passwordResetToken: {
                type: DataTypes.STRING(255),
                allowNull: true,
            },
        },
        {
            underscored: true,
        },
    );

    User.associate = (models) => {
        User.hasOne(models.Employee, {
            foreignKey: 'userId',
            as: 'employee',
        });
    };

    return User;
};