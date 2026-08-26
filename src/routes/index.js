import media from './media.js'
import user from './user.js'
import company from './company.js'
import department from './department.js'
import designation from './designation.js'
import HttpStatus from 'http-status';

const register = (app) => {
    app.use('/', [user, media, company, department, designation]);
    app.use((error, req, res, next) => {
        console.error(error);
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: false,
            errorMsg: error.message,
        });
    });
};

export default register;