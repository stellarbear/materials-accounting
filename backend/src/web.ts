import "reflect-metadata"
import { connect } from "./connect";
import { seed } from "./seed";
import { server } from "./server";
import { schemaBuild } from "./schema";

const main = async () => {
    const schema = await schemaBuild();
    await server(schema);
    await connect();
    await seed();
}

main();
