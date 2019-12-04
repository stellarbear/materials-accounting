import "reflect-metadata"
import { connect } from "./connect";
import { seed } from "./seed";
import { ipcMain } from 'electron';
import { createSchemaLink, createIpcExecutor } from 'graphql-transport-electron'
import { createWindow } from "./window";
import { schemaBuild } from "./schema";
import { server } from "./server";

const main = async () => {
    const schema = await schemaBuild();
    
    const link = createSchemaLink({ schema })
    createIpcExecutor({ link, ipc: ipcMain })

    await connect();
    await server(schema);
    await seed();
    
    await createWindow();
}

main();
