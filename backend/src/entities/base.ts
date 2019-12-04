import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity, Generated, Column } from "typeorm";
import { Field, ObjectType } from "type-graphql";
import { Trim } from "class-sanitizer";
import { Length } from "class-validator";


export class BaseMethods extends BaseEntity {
    async extend(object: Record<string, any>) {
        for (var key in object){
            if (object[key] !== undefined) {
                (this as any)[key] = object[key]
            }
        }

        //console.log(this);
        await this.save();
    }
}

@ObjectType()
export class Base extends BaseMethods {
    @Field()
    @PrimaryGeneratedColumn("uuid")
    id: string;

    //@Field()
    //@Column()
    //@Generated("uuid")
    //uuid: string;

    //@CreateDateColumn()
    //createdAt?: Date;

    //@UpdateDateColumn()
    //updatedAt?: Date;
}

@ObjectType()
export class BaseWithName extends Base {
    @Trim()
    @Field()
    @Column({ type: String, nullable: false, unique: true })
    @Length(1, 256)
    name: string;
}