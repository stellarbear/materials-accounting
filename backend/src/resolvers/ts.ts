import { Resolver, Query, Arg, Mutation, InputType, Field, Int, ObjectType, Ctx, UseMiddleware } from "type-graphql";
import { ExtError } from "../helpers/error";
import { like, set, between, include } from "../auxiliary/where";

import { di } from "../repositories";
import { isAuthenticated, isAuthenticatedByRole } from "../middleware/isAuthenticated";
import { ReturnType } from "./returnType";
import { Ts } from "../entities";

const intParse = (value: string | number): number => parseInt(value.toString(), 10)

@InputType()
class UnitInput {
    @Field({ nullable: true })
    id: string

    @Field()
    includeChildren: boolean
}

@InputType()
class YearInput {
    @Field(type => Int, { nullable: true })
    start: number

    @Field(type => Int, { nullable: true })
    end: number
}

@InputType()
class SearchInput {
    @Field()
    number: string;

    @Field(type => UnitInput)
    unit: UnitInput;

    @Field({ nullable: true })
    isBroken: boolean;

    @Field(type => [String])
    tsTypes: string[]

    @Field(type => [String])
    tsPurposes: string[]

    @Field(type => [String])
    infoTypes: string[]

    @Field(type => YearInput, { nullable: true })
    receiptYear: YearInput
    @Field(type => YearInput, { nullable: true })
    commissioningYear: YearInput
    @Field(type => YearInput, { nullable: true })
    decommissionYear: YearInput

    @Field({ nullable: true })
    table: string;
    @Field({ nullable: true })
    tableItem: string;
}

@InputType()
class SortInput {
    @Field()
    field: string;

    @Field()
    sortOrder: number;
}

@ObjectType()
class YearsRange {
    @Field(type => Int)
    receiptYearMin: number;
    @Field(type => Int)
    receiptYearMax: number;
    @Field(type => Int)
    commissioningYearMin: number;
    @Field(type => Int)
    commissioningYearMax: number;
    @Field(type => Int)
    decommissionYearMin: number;
    @Field(type => Int)
    decommissionYearMax: number;
}

const relations = ["unit", "infoType", "tsType", "table", "tableItem", "tsPurpose", "complectation"];
const getMinMax = (array: string[]): [number, number] => {
    const filteredArray = array.filter(a => a).map(s => intParse(s));
    const max = Math.max.apply(null, filteredArray);
    const min = Math.min.apply(null, filteredArray);

    return ([
        min == Infinity ? 1932 : min,
        max == -Infinity ? new Date().getFullYear() : max,
    ])
}

@Resolver()
export class TsResolver {
    @Query(returns => [Ts])
    @UseMiddleware(isAuthenticated)
    async allTS(
        @Arg('sort', { nullable: true }) sort: SortInput,
        @Arg('filter', { nullable: true }) filter: SearchInput,
        @Arg('skip', type => Int, { nullable: true }) skip: number,
        @Arg('limit', type => Int, { nullable: true }) take: number,
        @Ctx() ctx: Record<string, any>,
    ): Promise<Ts[]> {
        const { id } = ctx.req;
        const where = await this.buildWhere(filter, id);

        const response = await di.tsRepo.find({
            where,
            take,
            skip,
            relations,
        });

        if (sort) {
            switch (sort.field) {
                case "id":
                case "receiptYear":
                case "commissioningYear":
                case "decommissionYear":
                    return response.sort((a: any, b: any) => (a[sort.field] || "").localeCompare(b[sort.field] || "") * sort.sortOrder)

                case "tsType":
                case "tsPurpose":
                case "infoType":
                case "unit":
                    return response.sort((a: any, b: any) => (a[sort.field].id).localeCompare(b[sort.field].id) * sort.sortOrder)

                default:
                    return response;
            }
        }

        return response;
    }

    @Query(returns => Ts)
    @UseMiddleware(isAuthenticated)
    async getTS(
        @Arg('id') id: string,
        @Ctx() ctx: Record<string, any>,
    ): Promise<Ts> {
        const { id: userId } = ctx.req;
        if (userId) {
            const user = await di.userRepo.findOne({ where: { id: userId }, loadRelationIds: true });

            if (user && user.unit) {
                const currentUnit = await di.unitRepo.getById(user.unit, ["children"]);
                const unit = currentUnit ?
                    ([currentUnit, ...await currentUnit.getChildren()]).map(u => u.id)
                    : undefined;

                const where = {
                    ...set({ id }),
                    ...include({ unit }),
                };

                const ts = await di.tsRepo.findOne({ where, relations })
                return ts;
            }
        }

        const ts = await di.tsRepo.getById(id, relations);

        return ts;
    }

    @Query(returns => Int)
    @UseMiddleware(isAuthenticated)
    async tsCount(
        @Arg('filter', { nullable: true }) filter: SearchInput,
        @Ctx() ctx: Record<string, any>,
    ): Promise<number> {
        const { id } = ctx.req;
        const where = await this.buildWhere(filter, id);
        const response = await di.tsRepo.count({ where });

        return response;
    }

    @Query(returns => YearsRange)
    @UseMiddleware(isAuthenticated)
    async tsYearsRange(
        @Arg('filter', { nullable: true }) filter: SearchInput,

        @Ctx() ctx: Record<string, any>,
    ): Promise<YearsRange> {
        const { id } = ctx.req;
        const where = await this.buildWhere(filter, id);
        const response = await di.tsRepo.find({ where, relations });

        const [receiptYearMin, receiptYearMax] = getMinMax(response.map(r => r.receiptYear));
        const [commissioningYearMin, commissioningYearMax] = getMinMax(response.map(r => r.commissioningYear));
        const [decommissionYearMin, decommissionYearMax] = getMinMax(response.map(r => r.decommissionYear));

        return {
            receiptYearMin, receiptYearMax,
            commissioningYearMin, commissioningYearMax,
            decommissionYearMin, decommissionYearMax
        };
    }

    @Mutation(returns => ReturnType)
    @UseMiddleware(isAuthenticatedByRole(["moderator", "admin"]))
    async deleteTS(@Arg('id') id: string): Promise<ReturnType> {
        const ts = await di.tsRepo.getById(id, relations);

        await ts.remove();
        return ({
            id,
            status: "OK"
        });
    }

    @Mutation(returns => Ts)
    @UseMiddleware(isAuthenticatedByRole(["moderator", "admin"]))
    async createTS(
        @Arg('number') number: string,
        @Arg('unit') unit: string,
        @Arg('tsType') tsType: string,
        @Arg('tsPurpose') tsPurpose: string,
        @Arg('infoType') infoType: string,
        @Arg('receiptYear') receiptYear: string,
        @Arg('commissioningYear', { nullable: true }) commissioningYear: string,
        @Arg('decommissionYear', { nullable: true }) decommissionYear: string,
        @Arg('table') table: string,
        @Arg('tableItem') tableItem: string,
        @Arg('isBroken') isBroken: boolean,
        @Arg('complectation', type => [String]) complectation: [string]
    ): Promise<Ts> {
        if (await di.tsRepo.checkIfExist({ number })) {
            throw new ExtError({ code: "Запись с таким номером уже существует", field: 'number' })
        }

        const ts = new Ts();
        await ts.extend({
            number,
            isBroken,
            receiptYear,
            commissioningYear,
            decommissionYear,
            unit: await di.unitRepo.getById(unit),
            tsType: await di.tsTypeRepo.getById(tsType),
            tsPurpose: await di.tsPurposeRepo.getById(tsPurpose),
            infoType: await di.infoTypeRepo.getById(infoType),
            table: await di.tableRepo.getById(table),
            tableItem: await di.tableItemRepo.getById(tableItem),
            complectation: await di.tsTypeRepo.findByIds(complectation),
        })

        return ts;
    }

    @Mutation(returns => Ts)
    @UseMiddleware(isAuthenticatedByRole(["moderator", "admin"]))
    async updateTS(
        @Arg('id') id: string,
        @Arg('number') number: string,
        @Arg('unit') unit: string,
        @Arg('tsType') tsType: string,
        @Arg('tsPurpose') tsPurpose: string,
        @Arg('infoType') infoType: string,
        @Arg('receiptYear') receiptYear: string,
        @Arg('commissioningYear', { nullable: true }) commissioningYear: string,
        @Arg('decommissionYear', { nullable: true }) decommissionYear: string,
        @Arg('table') table: string,
        @Arg('tableItem') tableItem: string,
        @Arg('isBroken') isBroken: boolean,
        @Arg('complectation', type => [String]) complectation: [string]
    ): Promise<Ts> {
        if (await di.tsRepo.checkIfExistAndNotTheSame({ number }, id)) {
            throw new ExtError({ code: "Запись с номером именем уже существует", field: 'number' })
        }
        const ts = await di.tsRepo.getById(id);
        await ts.extend({
            number,
            isBroken,
            receiptYear,
            commissioningYear,
            decommissionYear,
            unit: await di.unitRepo.getById(unit),
            tsType: await di.tsTypeRepo.getById(tsType),
            tsPurpose: await di.tsPurposeRepo.getById(tsPurpose),
            infoType: await di.infoTypeRepo.getById(infoType),
            table: await di.tableRepo.getById(table),
            tableItem: await di.tableItemRepo.getById(tableItem),
            complectation: await di.tsTypeRepo.findByIds(complectation),
        })

        return ts;
    }

    buildWhere = async (filter: SearchInput, userId: string) => {
        const { number,
            unit: { id: unitId, includeChildren: unitChildren },
            isBroken,
            tsTypes: tsType,
            infoTypes: infoType,
            tsPurposes: tsPurpose,
            receiptYear,
            commissioningYear,
            decommissionYear,
            table: tableId,
            tableItem: tableItemId } = filter;

        const table = await di.tableRepo.getById(tableId);
        const tableItem = await di.tableItemRepo.getById(tableItemId);
        const currentUnit = await di.unitRepo.getById(unitId, ["children"]);
        const contextUnit = (await di.userRepo.findOne({ where: { id: userId }, relations: ["unit"] })).unit;
        const unit = (
            currentUnit
                ? unitChildren
                    ? [currentUnit, ...await currentUnit.getChildren()]
                    : [currentUnit]
                : contextUnit
                    ? [contextUnit, ...await contextUnit.getChildren()]
                    : []
        ).map(u => u.id)


        const where = {
            ...like({ number }),
            ...include({ tsPurpose, infoType, unit, tsType }),
            ...set({ isBroken, table, tableItem }),
            ...between({ receiptYear, commissioningYear, decommissionYear }, "start", "end")
        };

        return where;
    }
}