import { buildSchema } from "type-graphql";
import resolvers from "./resolvers";
//import { Container } from "typedi";
//import { useContainer } from "typeorm";

export const schemaBuild = async () => {
    //useContainer(Container)
    return await buildSchema({
        resolvers,
        //container: Container,
    });    
}
