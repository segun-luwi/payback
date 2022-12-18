/* eslint-disable max-len */
import dotenv from 'dotenv';

dotenv.config();

const config = {
  appName: process.env.APP_NAME,
  appUrl: process.env.APP_URL,
  baseUrl: process.env.BASE_URL,
  frontendUrl: process.env.FRONTEND_URL,
  jwtSecret: process.env.JWT_SECRET,
  mailHost: process.env.MAIL_HOST,
  mailPort: process.env.MAIL_PORT,
  mailSender: process.env.MAIL_SENDER,
  mailUsername: process.env.MAIL_USERNAME,
  mailPassword: process.env.MAIL_PASSWORD,
  taggun: process.env.TAGGUN,
  amazon_s3_access_key_id: process.env.AMAZON_S3_ACCESS_KEY_ID,
  amazon_s3_access_secret: process.env.AMAZON_S3_ACCESS_SECRET,
  amazon_s3_bucket: process.env.AMAZON_S3_BUCKET,
};

export default config;
