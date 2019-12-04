import { Entity, ManyToOne, OneToMany, Column } from "typeorm";
import { ObjectType, Field } from "type-graphql";
import { BaseWithName, Base } from "./base";
import { Trim } from "class-sanitizer";
import { Length } from "class-validator";

@Entity()
@ObjectType()
class Table extends BaseWithName {
    @Field(type => TableItem)
    @OneToMany(type => TableItem, tableItem => tableItem.table, { cascade: true })
    items: TableItem[];
}

@Entity()
@ObjectType()
class TableItem extends Base {

    @Trim()
    @Field()
    @Column({ type: String, nullable: false })
    @Length(1, 256)
    name: string;

    @Field()
    @ManyToOne(type => Table, table => table.items, { onDelete: 'CASCADE' })
    table: Table
}

export { Table, TableItem }