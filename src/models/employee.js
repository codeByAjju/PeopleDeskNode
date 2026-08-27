/* eslint-disable no-param-reassign */

export default (sequelize, DataTypes) => {
  const Employee = sequelize.define(
    'Employee',
    {
      employeeCode: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
      },

      firstName: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },

      lastName: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },

      phoneNumber: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },

      phoneNumberCountryCode: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },

      dateOfBirth: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      gender: {
        type: DataTypes.ENUM(
          'male',
          'female',
          'other',
          'prefer_not_to_say',
        ),
        allowNull: true,
      },

      dateOfJoining: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },

      dateOfLeaving: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },

      employmentType: {
        type: DataTypes.ENUM(
          'full_time',
          'part_time',
          'contract',
          'intern',
          'temporary',
        ),
        allowNull: false,
        defaultValue: 'full_time',
      },

      employmentStatus: {
        type: DataTypes.ENUM(
          'active',
          'on_leave',
          'notice_period',
          'resigned',
          'terminated',
          'inactive',
        ),
        allowNull: false,
        defaultValue: 'active',
      },

      profileImage: {
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

      departmentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      designationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      branchId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      locationId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      shiftId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      managerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        unique: true,
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
        {
          fields: ['department_id'],
        },
        {
          fields: ['designation_id'],
        },
        {
          fields: ['branch_id'],
        },
        {
          fields: ['location_id'],
        },
      ],
    },
  );

  Employee.associate = (models) => {
    Employee.belongsTo(models.Country, {
      foreignKey: 'countryId',
      as: 'country',
    });

    Employee.belongsTo(models.State, {
      foreignKey: 'stateId',
      as: 'state',
    });

    Employee.belongsTo(models.City, {
      foreignKey: 'cityId',
      as: 'city',
    });

    Employee.belongsTo(models.Department, {
      foreignKey: 'departmentId',
      as: 'department',
    });

    Employee.belongsTo(models.Designation, {
      foreignKey: 'designationId',
      as: 'designation',
    });

    Employee.belongsTo(models.Branch, {
      foreignKey: 'branchId',
      as: 'branch',
    });

    Employee.belongsTo(models.Location, {
      foreignKey: 'locationId',
      as: 'location',
    });

    Employee.belongsTo(models.Shift, {
      foreignKey: 'shiftId',
      as: 'shift',
    });

    Employee.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });

    Employee.belongsTo(models.Employee, {
      foreignKey: 'managerId',
      as: 'manager',
    });

    Employee.hasMany(models.Employee, {
      foreignKey: 'managerId',
      as: 'teamMembers',
    });
  };

  return Employee;
};