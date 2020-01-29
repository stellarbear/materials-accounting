import config from './ormconfig';
import { createConnection } from "typeorm";

export const connect = async () => {
    await createConnection(config);
}