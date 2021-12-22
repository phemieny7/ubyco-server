/**
 * Config source: https://git.io/JesV9
 *
 * Feel free to let us know via PR, if you find something broken in this config
 * file.
 */
import Url from "url-parse";
import Env from "@ioc:Adonis/Core/Env";
import { DatabaseConfig } from "@ioc:Adonis/Lucid/Database";

const DATABASE_URL = new Url(Env.get("DATABASE_URL"));
const databaseConfig: DatabaseConfig = {
  connection: Env.get("DB_CONNECTION"),

  connections: {
   
    pg: {
      client: "pg",
      connection: {
        host: Env.get("PG_HOST", DATABASE_URL.host),
        port: Env.get("PG_PORT", ''),
        user: Env.get("PG_USER", DATABASE_URL.username),
        password: Env.get("PG_PASSWORD", DATABASE_URL.password),
        database: Env.get("PG_DB_NAME", DATABASE_URL.pathname.substr(1)),
        // ssl: {
        //   rejectUnauthorized: false,
        // },
      },
      migrations: {
        naturalSort: false,
      },
      healthCheck: false,
      debug: false,
    },
  },
};

export default databaseConfig;
