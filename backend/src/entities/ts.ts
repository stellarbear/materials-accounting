import "reflect-metadata"
import { Entity, Column, ManyToOne, ManyToMany, JoinTable } from "typeorm";
import { Length } from "class-validator";
import { Trim } from 'class-sanitizer';
import { Unit } from "./unit";
import { InfoType } from "./infoType";
import { TsPurpose } from "./tsPurpose";
import { ObjectType, Field } from "type-graphql";
import { TsType } from "./tsType";
import { Table, TableItem } from "./table";
import { Base } from "./base";

@Entity()
@ObjectType()
export class Ts extends Base {
    @Trim()
    @Column({ type: String, nullable: false, unique: true })
    @Length(1, 256)
    @Field()
    number: string;

    @Field()
    @ManyToOne(type => Unit, { onDelete: 'CASCADE' })
    unit: Unit;

    @Field({ defaultValue: '' })
    @Column({ default: '' })
    responsible: string;

    @Field({ defaultValue: '' })
    @Column({ default: '' })
    comment: string;

    @Field()
    @ManyToOne(type => InfoType, { onDelete: 'CASCADE' })
    infoType: InfoType;

    @Field(type => [TsType])
    @ManyToMany(type => TsType, { cascade: true })
    @JoinTable()
    complectation: TsType[];

    @Field()
    @ManyToOne(type => TsType, { onDelete: 'CASCADE' })
    tsType: TsType;

    @Field(type => String)
    @Column()
    receiptYear: string;
    @Field(type => String, { nullable: true })
    @Column({ nullable: true })
    commissioningYear: string;
    @Field(type => String, { nullable: true })
    @Column({ nullable: true })
    decommissionYear: string;

    @Field()
    @ManyToOne(type => Table, { onDelete: 'CASCADE' })
    table: Table;

    @Field({nullable: true})
    @ManyToOne(type => TableItem, { nullable: true, onDelete: 'CASCADE' })
    tableItem: TableItem;

    @Field()
    @Column({ default: false })
    isBroken: boolean

    @Field()
    @Column({ default: false })
    isPrivate: boolean

    @Field()
    @ManyToOne(type => TsPurpose, { onDelete: 'CASCADE' })
    tsPurpose: TsPurpose;
}