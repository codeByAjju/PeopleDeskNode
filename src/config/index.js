import dotenv from 'dotenv';

dotenv.config();

export default {
  database: {
    mysql: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      db: process.env.DB_NAME,
      timezone: '+00:00',
    },
  },
  email: {
    emailAddress: process.env.MY_EMAIL,
    password: process.env.EMAIL_PASSWORD
  },
  jwtSecret: process.env.JWT_SECRET,
  jwtExpireIn: process.env.JWT_EXPIRE_IN,

  app:{
    url:process.env.APP_URL
  }
}