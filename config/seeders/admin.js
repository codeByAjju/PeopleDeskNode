const table = 'users';

const listArray = [
    {
        email: 'xyz@yopmail.com',
        password: '$2a$08$dQWrGSXodiFE5gn7jphCB.tAFU30pzBRSueeBewbhTxfEnr8l/1FK',
        firstName: 'xyz',
        lastName: 'xyz',
        role: 'admin',
        status: 'active'
    },
];

const data = listArray.map(
    ({ email, password, firstName, lastName, role, status }) => ({
        email,
        password,
        firstName,
        lastName,
        role,
        status,
        createdAt: new Date(),
        updatedAt: new Date(),
    })
);

export const up = async (queryInterface) => {
    await queryInterface.bulkInsert(table, data, {});
};

export const down = async (queryInterface) => {
    await queryInterface.bulkDelete(table, null, {});
};