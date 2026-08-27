import media from './media.js';
import user from './user.js';
import company from './company.js';
import department from './department.js';
import designation from './designation.js';
import country from './country.js';
import state from './state.js';
import city from './city.js';
import branch from './branch.js';
import location from './location.js';
import HttpStatus from 'http-status';

const register = (app) => {
    app.use('/', [user, media, company, department, designation, country, state, city, branch, location]);
    app.use((error, req, res, next) => {
        console.error(error);
        return res.status(HttpStatus.BAD_REQUEST).json({
            status: false,
            errorMsg: error.message,
        });
    });
};

export default register;