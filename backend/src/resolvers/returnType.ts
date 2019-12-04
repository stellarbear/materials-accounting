import { ObjectType, Field } from "type-graphql";

@ObjectType()
export class ReturnType {
    @Field()
    id: string;

    @Field()
    status: string;
}