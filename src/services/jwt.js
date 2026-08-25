import jwt from 'jsonwebtoken';
import config from '../config/index.js';

export default{
    createToken(payload){
        return jwt.sign(payload,config.jwtSecret,{
            expiresIn : config.jwtExpireIn
        });
    },
    verifyToken(token){
        return jwt.verify(token,config.jwtSecret,{
            expiresIn : config.jwtExpireIn
        });
    },
    decodeToken(token){
        return jwt.decode(token,{
            complete:true,
        });
    }
}