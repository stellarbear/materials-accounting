import { Entity, Column } from "typeorm";
import { ObjectType, Field } from "type-graphql";
import { BaseWithName } from "./base";

@Entity()
@ObjectType()
export class TsType extends BaseWithName {
	@Field()
    @Column({ nullable: false, default: false })
    withComplectation: boolean;
}