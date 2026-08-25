export default (sequelize, DataTypes) => {
  const Department = sequelize.define(
    'Department',
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
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

  Department.associate = (models) => {
    Department.hasMany(models.Employee, {
      foreignKey: 'departmentId',
      as: 'employees',
    });

    Department.hasMany(models.Designation, {
      foreignKey: 'departmentId',
      as: 'designations',
    });
  };

  return Department;
};