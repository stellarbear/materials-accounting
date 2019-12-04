
import { entities } from './entities';
import { createConnection, ConnectionOptions } from "typeorm";

export const connect = async () => {
    const options: ConnectionOptions = {
        name: "default",
        type: "sqlite",
        synchronize: true,
        dropSchema: false,
        //logging: true,
        logger: "simple-console",
        database: "./src/data/db.sqlite",
        entities
    }

    await createConnection(options);
}