/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */
import Url from 'url-parse'
import Env from '@ioc:Adonis/Core/Env'
import { DatabaseConfig } from '@ioc:Adonis/Lucid/Database'

const DATABASE_URL = new Url(Env.get('DATABASE_URL'))
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
  connection: Env.get('DB_CONNECTION'),

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
        host: DATABASE_URL.host as string,
        port: Number(''),
        user:  DATABASE_URL.user as string,
        password:  DATABASE_URL.password as string,
        database:  DATABASE_URL.pathname.substr(1) as string,
        ssl:{
          rejectUnauthorized:false
        }
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
