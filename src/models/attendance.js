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

            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                comment: 'Authoritative working date',
            },

            checkIn: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: 'Official check-in timestamp',
            },

            checkOut: {
                type: DataTypes.DATE,
                allowNull: true,
                comment: 'Official check-out timestamp',
            },

            status: {
                type: DataTypes.ENUM(
                    'present',
                    'late',
                    'half_day',
                    'absent',
                    'leave',
                    'holiday',
                    'week_off',
                    'pending',
                    'corrected',
                ),
                allowNull: false,
                defaultValue: 'present',
            },

            workDuration: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: 'Total work duration in minutes',
            },

            lateMinutes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: 'Late check-in minutes relative to shift start',
            },

            earlyLeaveMinutes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: 'Early checkout minutes relative to shift end',
            },

            overtimeMinutes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
                comment: 'Overtime minutes beyond shift end',
            },

            checkInIp: {
                type: DataTypes.STRING(45),
                allowNull: true,
            },

            checkOutIp: {
                type: DataTypes.STRING(45),
                allowNull: true,
            },

            checkInUserAgent: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            checkOutUserAgent: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            checkInLatitude: {
                type: DataTypes.DECIMAL(10, 8),
                allowNull: true,
            },

            checkInLongitude: {
                type: DataTypes.DECIMAL(11, 8),
                allowNull: true,
            },

            checkOutLatitude: {
                type: DataTypes.DECIMAL(10, 8),
                allowNull: true,
            },

            checkOutLongitude: {
                type: DataTypes.DECIMAL(11, 8),
                allowNull: true,
            },

            checkInSource: {
                type: DataTypes.ENUM('web', 'mobile', 'biometric', 'admin', 'system'),
                allowNull: false,
                defaultValue: 'web',
            },

            checkOutSource: {
                type: DataTypes.ENUM('web', 'mobile', 'biometric', 'admin', 'system'),
                allowNull: false,
                defaultValue: 'web',
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

            approvedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },

            approvedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },

            isCorrected: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },

            correctionReason: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            correctedBy: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
            },

            statusRecord: {
                type: DataTypes.ENUM('active', 'inactive', 'deleted'),
                allowNull: false,
                defaultValue: 'active',
            },

            deletedAt: {
                type: DataTypes.DATE,
                allowNull: true,
            },
        },
        {
            underscored: true,
            paranoid: true,
            indexes: [
                {
                    fields: ['employee_id'],
                },
                {
                    fields: ['date'],
                },
                {
                    fields: ['employee_id', 'date'],
                    unique: true,
                },
                {
                    fields: ['shift_id'],
                },
                {
                    fields: ['location_id'],
                },
                {
                    fields: ['status_record'],
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

        Attendance.belongsTo(models.User, {
            foreignKey: 'approvedBy',
            as: 'approver',
        });

        Attendance.belongsTo(models.User, {
            foreignKey: 'correctedBy',
            as: 'corrector',
        });

        if (models.AttendanceAudit) {
            Attendance.hasMany(models.AttendanceAudit, {
                foreignKey: 'attendanceId',
                as: 'auditLogs',
            });
        }
    };

    return Attendance;
};