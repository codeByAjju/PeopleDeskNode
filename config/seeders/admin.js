const table = 'users';

const listArray = [
    {
        email: 'xyz@yopmail.com',
        password: '$2a$08$dQWrGSXodiFE5gn7jphCB.tAFU30pzBRSueeBewbhTxfEnr8l/1FK',
        first_name: 'xyz',
        last_name: 'xyz',
        role: 'super_admin',
        status: 'active'
    },
    {
        email: 'admin@yopmail.com',
        password: '$2a$08$dQWrGSXodiFE5gn7jphCB.tAFU30pzBRSueeBewbhTxfEnr8l/1FK',
        first_name: 'Admin',
        last_name: 'Admin',
        role: 'admin',
        status: 'active'
    }
];

const data = listArray.map(
    ({ email, password, first_name, last_name, role, status }) => ({
        email,
        password,
        first_name,
        last_name,
        role,
        status,
        created_at: new Date(),
        updated_at: new Date(),
    })
);

export const up = async (queryInterface) => {
    await queryInterface.bulkInsert(table, data, {});
};

export const down = async (queryInterface) => {
    await queryInterface.bulkDelete(table, null, {});
};