import { Entity } from "typeorm";
import { ObjectType } from "type-graphql";
import { BaseWithName } from "./base";

@Entity()
@ObjectType()
export class InfoType extends BaseWithName {

}