/* eslint-disable prefer-template */
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();
import { DataSource, DataSourceOptions } from 'typeorm';
import { databaseConfigSchema } from '../src/utils';
import type { TypeOrmModuleOptions } from '@nestjs/typeorm';

const migrations = [__dirname + `/database/migrations/*{.ts,.js}`];
const entities = [__dirname + '/../src/modules/**/*.entity{.ts,.js}'];

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : undefined,
  synchronize: false,
  entities,
  migrations,
  subscribers: [],
};

const { error } = databaseConfigSchema.validate(dataSourceOptions);

if (error) throw new Error(`Invalid database configuration: ${error.message}`);

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  entities,
  migrations,
  name: 'default',
  host: process.env.POSTGRES_HOST,
  port: parseInt(process.env.POSTGRES_PORT, 10),
  username: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
  migrationsRun: true,
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;
