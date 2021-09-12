'use strict';

if (process.env.NODE_ENV !== 'production') require('dotenv').config();

let env = process.env.NODE_ENV || 'development';

if (env === 'development') {
  process.env.DATABASE_URI = process.env.DEV_URI;
  process.env.PORT = 5000;
  process.env.GOOGLE_SERVICE_ACCOUNT = process.env.DEV_GOOGLE_SERVICE_ACCOUNT;
  process.env.GOOGLE_CALENDAR_ID = process.env.DEV_GOOGLE_CALENDAR_ID;
  process.env.GOOGLE_SA_CREDENTIALS = process.env.DEV_GOOGLE_SA_CREDENTIALS;
} else if (env === 'test') {
  process.env.DATABASE_URI = 'mongodb://localhost:27017/test-shftr-db';
} else if (env === 'production') {
  process.env.DATABASE_URI = process.env.PROD_URI;
  process.env.GOOGLE_SERVICE_ACCOUNT = process.env.PROD_GOOGLE_SERVICE_ACCOUNT;
  process.env.GOOGLE_CALENDAR_ID = process.env.PROD_GOOGLE_CALENDAR_ID;
  process.env.GOOGLE_SA_CREDENTIALS = process.env.PROD_GOOGLE_SA_CREDENTIALS;
}

let dataBaseName = '';

if (process.env.DATABASE_URI.indexOf('?') != -1) {
  dataBaseName = process.env.DATABASE_URI.slice(
    process.env.DATABASE_URI.lastIndexOf('/') + 1,
    process.env.DATABASE_URI.indexOf('?')
  );
} else {
  dataBaseName = process.env.DATABASE_URI.slice(process.env.DATABASE_URI.lastIndexOf('/') + 1);
}

console.log('ENVIRONMENT: ', env);
console.log('DATABASE: ', dataBaseName);
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
