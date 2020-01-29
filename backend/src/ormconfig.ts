import { ConnectionOptions } from 'typeorm';
import { entities } from './entities';

//  https://github.com/typeorm/typeorm/issues/5003
//  https://wanago.io/2019/01/28/typeorm-migrations-postgres/
const config: ConnectionOptions = {
    name: "default",
    type: "sqlite",
    synchronize: true,
    dropSchema: false,
    //logging: true,
    logger: "simple-console",
    database: "./src/data/db.sqlite",
    entities,
    migrations: [__dirname + '/migrations/*{.ts,.js}',],
    cli: {
        migrationsDir: "./src/migrations"
    },
};

// for migrations: export = config;
export default config;