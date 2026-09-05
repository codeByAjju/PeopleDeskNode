/* eslint-disable no-param-reassign */

export default (sequelize, DataTypes) => {
    const AttendanceAudit = sequelize.define(
        'AttendanceAudit',
        {
            attendanceId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'attendances',
                    key: 'id',
                },
            },

            employeeId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'employees',
                    key: 'id',
                },
            },

            userId: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id',
                },
                comment: 'User who triggered or performed the action',
            },

            action: {
                type: DataTypes.ENUM(
                    'CHECK_IN',
                    'CHECK_OUT',
                    'CHECK_IN_FAILED',
                    'CHECK_OUT_FAILED',
                    'CORRECTION',
                    'DELETE',
                    'RESTORE',
                    'STATUS_UPDATE',
                    'SECURITY_FLAG',
                    'POLICY_CREATE',
                    'POLICY_UPDATE',
                    'POLICY_ACTIVATE',
                ),
                allowNull: false,
            },

            ipAddress: {
                type: DataTypes.STRING(45),
                allowNull: true,
            },

            userAgent: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            beforeValues: {
                type: DataTypes.JSON,
                allowNull: true,
            },

            afterValues: {
                type: DataTypes.JSON,
                allowNull: true,
            },

            reason: {
                type: DataTypes.TEXT,
                allowNull: true,
            },

            status: {
                type: DataTypes.ENUM('SUCCESS', 'FAILURE'),
                allowNull: false,
                defaultValue: 'SUCCESS',
            },

            details: {
                type: DataTypes.JSON,
                allowNull: true,
            },
        },
        {
            underscored: true,
            indexes: [
                {
                    fields: ['attendance_id'],
                },
                {
                    fields: ['employee_id'],
                },
                {
                    fields: ['user_id'],
                },
                {
                    fields: ['action'],
                },
                {
                    fields: ['created_at'],
                },
            ],
        },
    );

    AttendanceAudit.associate = (models) => {
        AttendanceAudit.belongsTo(models.Attendance, {
            foreignKey: 'attendanceId',
            as: 'attendance',
        });

        AttendanceAudit.belongsTo(models.Employee, {
            foreignKey: 'employeeId',
            as: 'employee',
        });

        AttendanceAudit.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });
    };

    return AttendanceAudit;
};
