export default (sequelize, DataTypes) => {
    const media = sequelize.define('media', {
        name: {
            type: DataTypes.STRING,
        },
        basePath: {
            type: DataTypes.STRING,
        },
        baseUrl: {
            type: DataTypes.STRING,
        },
        mediaType: {
            type: DataTypes.ENUM('image', 'file', 'audio', 'video'),
        },
        mediaFor: {
            type: DataTypes.ENUM(
                'user',
                'banner',
                'admin',
                'company',
                'employee',
                'branch',
                'designation',
                'shift',
                'hr_manager',
                'super_admin',
                'admin',
                'hr',
                'it_manager',
                'it',
                'dev_manager',
                'dev',
                'qa_manager',
                'qa',
                'pm_manager',
                'pm',
                'project_manager',
            ),
        },
        status: {
            type: DataTypes.ENUM('pending', 'used', 'deleted'),
            defaultValue: 'pending',
        },
    });

    return media;
}