import { config as _config } from 'dotenv';

_config();

const config = {
  db: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  },
  server: {
    port: process.env.PORT,
  },
  nodeEnv: process.env.NODE_ENV,
};

export default config;