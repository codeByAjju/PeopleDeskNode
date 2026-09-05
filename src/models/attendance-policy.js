/* eslint-disable no-param-reassign */

export default (sequelize, DataTypes) => {
    const AttendancePolicy = sequelize.define(
        'AttendancePolicy',
        {
            name: {
                type: DataTypes.STRING(100),
                allowNull: false,
            },

            gracePeriodMinutes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 15,
                comment: 'Late grace period in minutes',
            },

            halfDayMinutes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 240,
                comment: 'Work duration threshold for half day in minutes',
            },

            fullDayMinutes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 480,
                comment: 'Work duration threshold for full day in minutes',
            },

            earlyLeaveGraceMinutes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 15,
                comment: 'Early leave grace period in minutes',
            },

            overtimeEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false,
            },

            overtimeGraceMinutes: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 30,
                comment: 'Overtime grace period before counting overtime',
            },

            locationRequired: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                comment: 'Whether GPS coordinates are required for check-in/out',
            },

            geofenceEnabled: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
                comment: 'Whether office geofence radius check is enforced',
            },

            maxGpsAccuracyMeters: {
                type: DataTypes.INTEGER,
                allowNull: true,
                comment: 'Maximum allowed GPS accuracy error in meters',
            },

            isActive: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },

            effectiveFrom: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },

            effectiveTo: {
                type: DataTypes.DATEONLY,
                allowNull: true,
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
            tableName: 'attendance_policies',
            indexes: [
                {
                    fields: ['is_active'],
                },
                {
                    fields: ['effective_from'],
                },
                {
                    fields: ['effective_to'],
                },
                {
                    fields: ['status_record'],
                },
            ],
        },
    );

    AttendancePolicy.associate = (models) => {
        if (models.Attendance) {
            AttendancePolicy.hasMany(models.Attendance, {
                foreignKey: 'policyId',
                as: 'attendances',
            });
        }
    };

    return AttendancePolicy;
};
