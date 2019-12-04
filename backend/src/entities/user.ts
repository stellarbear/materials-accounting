import "reflect-metadata"
import { Entity, Column, OneToOne, JoinColumn, ManyToOne } from "typeorm";
import { Length } from "class-validator";
import { Trim } from 'class-sanitizer';
import { ObjectType, Field, Int } from "type-graphql";
import { Unit } from "./unit";
import { Base } from "./base";

@ObjectType()
@Entity()
export class User extends Base {
    @Field()
    @Trim()
    @Column({ type: String, nullable: false, unique: true })
    @Length(1, 256)
    username: string;

    @Column({ type: String, nullable: false })
    @Length(6, 256)
    password: string;

    @Field({ nullable: true })
    @ManyToOne(type => Unit, { nullable: true, onDelete: "SET NULL" })
    @JoinColumn()
    unit: Unit;

    @Field()
    @Column({ default: "user" })
    role: string;

    @Column()
    salt: string;

	@Column()
	@Field()
	session: string;

    //static ??
}