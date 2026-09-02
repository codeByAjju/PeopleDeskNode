/* eslint-disable no-param-reassign */

export default (sequelize, DataTypes) => {
    const Attendance = sequelize.define(
        'Attendance',
        {
            employeeId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: 'employees',
                    key: 'id',
                },
            },

            attendanceDate: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                comment: 'Employee working date',
            },

            checkIn: {
                type: DataTypes.DATE,
                allowNull: true,
            },

            checkOut: {
                type: DataTypes.DATE,
                allowNull: true,
            },

            status: {
                type: DataTypes.ENUM(
                    'present',
                    'absent',
                    'half_day',
                    'leave',
                    'holiday',
                    'week_off',
                ),
                allowNull: false,
                defaultValue: 'present',
            },

            checkInStatus: {
                type: DataTypes.ENUM(
                    'on_time',
                    'late',
                ),
                allowNull: true,
            },

            checkOutStatus: {
                type: DataTypes.ENUM(
                    'on_time',
                    'early',
                    'late',
                ),
                allowNull: true,
            },

            lateMinutes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            earlyLeaveMinutes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            workingMinutes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: 'Total worked minutes',
            },

            shiftId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'shifts',
                    key: 'id',
                },
            },

            locationId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'locations',
                    key: 'id',
                },
            },

            remarks: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            statusRecord: {
                type: DataTypes.ENUM(
                    'active',
                    'inactive',
                    'deleted',
                ),
                allowNull: false,
                defaultValue: 'active',
            },
        },
        {
            underscored: true,

            indexes: [
                {
                    fields: ['employee_id'],
                },
                {
                    fields: ['attendance_date'],
                },
                {
                    fields: ['employee_id', 'attendance_date'],
                    unique: true,
                },
                {
                    fields: ['shift_id'],
                },
                {
                    fields: ['location_id'],
                },
            ],
        },
    );

    Attendance.associate = (models) => {
        Attendance.belongsTo(models.Employee, {
            foreignKey: 'employeeId',
            as: 'employee',
        });

        Attendance.belongsTo(models.Shift, {
            foreignKey: 'shiftId',
            as: 'shift',
        });

        Attendance.belongsTo(models.Location, {
            foreignKey: 'locationId',
            as: 'location',
        });
    };

    return Attendance;
};