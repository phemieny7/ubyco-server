/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */

import Env from '@ioc:Adonis/Core/Env'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'
import Application from '@ioc:Adonis/Core/Application'

import Url from 'url-parse'
const CLEARDB_DATABASE_URL = new Url(Env.get(‘CLEARDB_DATABASE_URL’))


const databaseConfig: DatabaseConfig = {
  /*
  |--------------------------------------------------------------------------
  | Connection
  |--------------------------------------------------------------------------
  |
  | The primary connection for making database queries across the application
  | You can use any key from the `connections` object defined in this same
  | file.
  |
  */
  // connection: Env.get('DB_CONNECTION'),
  connection: Application.inDev ? Env.get('DB_CONNECTION') : 'pgs'
  connections: {
    /*
    |--------------------------------------------------------------------------
    | PostgreSQL config
    |--------------------------------------------------------------------------
    |
    | Configuration for PostgreSQL database. Make sure to install the driver
    | from npm when using this connection
    |
    | npm i pg
    |
    */
    pg: {
      client: 'pg',
      connection: {
        host: CLEARDB_DATABASE_URL.host as string,
        port: Number(''),
        user: CLEARDB_DATABASE_URL.username as string,
        password: CLEARDB_DATABASE_URL.password as string,
        database: CLEARDB_DATABASE_URL.pathname.substr(1) as string
      },
      migrations: {
        naturalSort: false,
      },
      healthCheck: false,
      debug: false,
    },

  }
}

export default databaseConfig
