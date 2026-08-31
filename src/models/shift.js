/* eslint-disable no-param-reassign */

export default (sequelize, DataTypes) => {
  const Shift = sequelize.define(
    'Shift',
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

      startTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },

      endTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },

      breakDuration: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Break duration in minutes',
      },

      workingHours: {
        type: DataTypes.DECIMAL(4, 2),
        allowNull: false,
      },
      isOvernight: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

  Shift.associate = (models) => {
    Shift.hasMany(models.Employee, {
      foreignKey: 'shiftId',
      as: 'employees',
    });
  };

  return Shift;
};