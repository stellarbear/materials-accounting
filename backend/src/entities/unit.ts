import { Entity, OneToMany, ManyToOne, Column, AfterUpdate, AfterInsert } from "typeorm";
import { ObjectType, Field } from "type-graphql";
import { Base } from "./base";
import { getParents, getChildren } from "../auxiliary/tree";
import { Trim } from "class-sanitizer";
import { Length } from "class-validator";

@ObjectType()
@Entity()
export class Unit extends Base {
	@Trim()
	@Field()
	@Column({ type: String, nullable: false })
	@Length(1, 256)
	name: string;

	@Field(type => [Unit], { nullable: true, description: "All the children of item" })
	@OneToMany(type => Unit, unit => unit.parent, { nullable: true, cascade: true })
	children: Unit[];

	@Field(type => Unit, { nullable: true, description: "Contains one parent" })
	@ManyToOne(type => Unit, unit => unit.children, { nullable: true, onDelete: 'CASCADE' })
	parent: Unit;

	@Field(type => [String])
	@Column("simple-array", { nullable: true })
	fullPath: string[] = []

	@AfterInsert()
	async getFullPath() {
		const { id, name } = this;
		const relations = ["parent", "children"]
		const currentUnit = await Unit.findOne({ where: { id }, relations });
		const fullPath = [...(currentUnit.parent ? currentUnit.parent.fullPath : []), name].filter(p => p);

		if (this.fullPath.length == 0) {
			await this.extend({ fullPath });
		}

		//	Update all children
		await Promise.all(currentUnit.children.map(async child => await child.getFullPath()))
	}

	async getChildren() {
		const { id } = this;
		const relations = ["parent", "children"]

		const allUnits = await Unit.find({ relations });
		const currentUnit = await Unit.findOne({ where: { id }, relations });

		return getChildren(allUnits, currentUnit, "children");
	}
	async getParents() {
		const { id } = this;
		const relations = ["parent", "children"]

		const allUnits = await Unit.find({ relations });
		const currentUnit = await Unit.findOne({ where: { id }, relations });

		return getParents(allUnits, currentUnit, "parent");
	}
}