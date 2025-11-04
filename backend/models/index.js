const { Sequelize } = require('sequelize');
require('dotenv').config();

const shouldUseSsl = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';
const dialectOptions = {};

if (shouldUseSsl) {
  dialectOptions.ssl = {
    require: true,
    rejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED === 'false' ? false : true,
  };
}

if (process.env.DB_CONN_TIMEOUT_MS) {
  dialectOptions.connectTimeout = Number(process.env.DB_CONN_TIMEOUT_MS);
}

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    dialect: process.env.DB_DIALECT,
    logging: false,
    dialectOptions,
    pool: {
      max: 10,
      min: 0,
      acquire: 60000,
      idle: 10000,
    },
  }
);

module.exports = sequelize;