import { Resolver, Query, Arg, Mutation, UseMiddleware } from "type-graphql";
import { Ts, TsType, InfoType, TsPurpose, Table, Unit, TableItem } from "../entities";
import { BaseEntity, In, Not } from "typeorm";
import { UserInputError } from "apollo-server";
import { di } from "../repositories";
import { include, set } from "../auxiliary/where";
import { Base } from "../entities/base";
import { isAuthenticatedByRole } from "../middleware/isAuthenticated";

const detectDeprecated = async (model: typeof Base, importData: Record<string, any>[], key: string) => {
    const localData = await model.find({});
    const importId = importData.map(d => d.id);
    const deprecated = localData.filter(d => !importId.includes(d.id));

    if (deprecated.length == 0) {
        return;
    }

    const result = await di.tsRepo.find({
        where: {
            ...include({ [key]: deprecated.map(d => d.id) })
        }
    })

    if (result.length > 0) {
        throw new UserInputError(`Несовместимые изменения словарей.` +
            ` \n\n\rТС под номерами: ${result.map(r => r.number)} зависят от удаляемых словарных полей:` +
            ` ${deprecated.map((d: any) => d.name)}.`);
    }
}


const mergeConditional = async (model: typeof Base, importData: Record<string, any>[], key: string) => {
    const uniqueKeys = [...new Set(importData.map(i => i[key]))];

    for (let uniqueKey of uniqueKeys) {
        const localData = await model.find({ where: { [key]: uniqueKey } });
        const localId = localData.map(l => l.id);
        const importId = importData.filter(i => i[key] == uniqueKey).map(i => i.id);

        const deprecated = localData.filter(d => !importId.includes(d.id));
        const updated = importData.filter(i => localId.includes(i.id));
        const inserted = importData.filter(i => !localId.includes(i.id));

        //  remove
        await model.remove(deprecated);

        //  update
        for (let data of updated) {
            const m = await model.findOne({ where: { id: data.id } });
            await m.extend({ ...data });
        }

        //  insert
        for (let data of inserted) {
            const m = new model();
            await m.extend({ ...data });
        }
    }
}

const merge = async (model: typeof Base, importData: Record<string, any>[]) => {
    const localData = await model.find({});
    const localId = localData.map(l => l.id);
    const importId = importData.map(d => d.id);
    const deprecated = localData.filter(d => !importId.includes(d.id));
    const updated = importData.filter(i => localId.includes(i.id));
    const inserted = importData.filter(i => !localId.includes(i.id));

    //  remove
    await model.remove(deprecated);

    //  update
    for (let data of updated) {
        const m = await model.findOne({ where: { id: data.id } });
        await m.extend({ ...data });
    }

    //  insert
    for (let data of inserted) {
        const m = new model();
        await m.extend({ ...data });
    }
}

const drop = async (model: typeof Base) => {
    for (const old of await model.find({})) {
        await old.remove();
    }
}

const save = async (model: typeof Base, importData: Record<string, any>[]) => {
    for (let data of importData) {
        const m = new model();
        await m.extend({ ...data });
    }
}

@Resolver()
export class ManagementResolver {
    @Query(returns => String)
    async convert(
        @Arg("input") input: string,
        @Arg("type") type: string
    ) {
        const replaceAll = (input: string, map: Record<string, string>) => {
            for (const key in map) {
                input = input.replace(new RegExp(key, 'g'), map[key])
            }

            return input;
        }

        const getById = (array: any[], id: string) => array.filter(a => a.id == id)[0].name

        const replace = replaceAll(input, {
            '"_id"': '"id"',
            '"unitID"': '"unit"',
            '"typeID"': '"tsType"',
            '"tableID"': '"table"',
            '"type"': '"tsType"',
            '"purpose"': '"tsPurpose"',
            '"infoTypeID"': '"infoType"',
            '"purposeID"': '"tsPurpose"',
            '"tableItemID"': '"tableItem"',
        });

        const data = JSON.parse(replace);
        data.tableItems = data.tables.flatMap((table: any) => table.items.map((item: any) => ({ ...item, table: table.id })))
        data.tables = data.tables.map((table: any) => ({ ...table, items: table.items.map((item: any) => item.id) }))

        switch (type) {
            case "db":
            case "dicts":
                return JSON.stringify({
                    ...data,
                    type
                })
            case "ts":
                data.ts = data.ts.map((ts: any) => (
                    {
                        number: ts.number,
                        unit: data.unit.name,
                        tsType: getById(data.tsTypes, ts.tsType),
                        tsPurpose: getById(data.tsPurposes, ts.tsPurpose),
                        infoType: getById(data.infoTypes, ts.infoType),
                        receiptYear: ts.receiptYear,
                        commissioningYear: ts.commissioningYear,
                        decommissionYear: ts.decommissionYear,
                        table: getById(data.tables, ts.table),
                        tableItem: getById(data.tableItems, ts.tableItem),
                        isBroken: ts.isBroken,
                        complectation: ts.complectation.map((c: any) => getById(data.tsTypes, c)),
                    }
                ))

                const convertedTs = []
                const failedTs = []
                let failedProps: Record<string, string[]> = {};
                const extendFailed = (obj: Record<string, string[]>, key: string, entity: any | undefined, name: string) => {
                    if (entity != undefined) {
                        return obj
                    }

                    const value: string[] = obj[key] ?? [];
                    if (value.includes(name)) {
                        return obj
                    }

                    obj[key] = [...value, name];

                    return obj;
                }

                for (let ts of data.ts) {

                    let tsType = (await di.tsTypeRepo.findOne({ where: { name: ts.tsType } }))?.id;
                    let tsPurpose = (await di.tsPurposeRepo.findOne({ where: { name: ts.tsPurpose } }))?.id;
                    let infoType = (await di.infoTypeRepo.findOne({ where: { name: ts.infoType } }))?.id;
                    let table = (await di.tableRepo.findOne({ where: { name: ts.table } }))?.id;
                    let tableItem = (await di.tableItemRepo.findOne({ where: { name: ts.tableItem } }))?.id;
                    let complectation = (await di.tsTypeRepo.find({ where: { name: In(ts.complectation) } }))?.map(c => c.id);

                    if (
                        [tsType, tsPurpose, infoType, table, tableItem].includes(undefined) ||
                        complectation.length != ts.complectation.length
                    ) {
                        failedProps = extendFailed(failedProps, "tsType", tsType, ts.tsType)
                        failedProps = extendFailed(failedProps, "tsPurpose", tsPurpose, ts.tsPurpose)
                        failedProps = extendFailed(failedProps, "infoType", infoType, ts.infoType)
                        failedProps = extendFailed(failedProps, "table", table, ts.table)
                        failedProps = extendFailed(failedProps, "tableItem", tableItem, ts.tableItem)
                        if (complectation.length != ts.complectation.length) {
                            failedProps = extendFailed(failedProps, "complectation", complectation, ts.complectation)
                        }

                        failedTs.push(ts.number);
                    }

                    const converted = {
                        ...ts,
                        tsType: tsType ?? ts.tsType,
                        tsPurpose: tsPurpose ?? ts.tsPurpose,
                        infoType: infoType ?? ts.infoType,
                        table: table ?? ts.table,
                        tableItem: tableItem ?? ts.tableItem,
                        complectation: complectation.length == ts.complectation.length ? complectation : ts.complectation,
                    }

                    convertedTs.push(converted)
                }

                if (failedTs.length) {
                    throw new UserInputError(`Некорректные словарные поля: \n\n` +
                        `ТС: ${failedTs}\n\n` +
                        `${Object.keys(failedProps).map(key => `${key}: ${failedProps[key]}\n`)}`)
                }


                return JSON.stringify({
                    ts: convertedTs,
                    time: data.time,
                    type: "ts"
                })
        }
    }

    //  Shall we export units???
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    @Query(returns => String)
    async exportDicts() {
        const response = {
            tsTypes: await di.tsTypeRepo.getAll(),
            infoTypes: await di.infoTypeRepo.getAll(),
            tables: await di.tableRepo.getAll(),
            tableItems: await di.tableItemRepo.getAll(),
            tsPurposes: await di.tsPurposeRepo.getAll(),
            time: new Date().getTime(),
            type: "dicts",
        }

        return JSON.stringify(response);
    }

    @Query(returns => String)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async exportDB() {
        const response = {
            ts: await di.tsRepo.getAll(),
            tsTypes: await di.tsTypeRepo.getAll(),
            infoTypes: await di.infoTypeRepo.getAll(),
            tables: await di.tableRepo.getAll(),
            tableItems: await di.tableItemRepo.getAll(),
            tsPurposes: await di.tsPurposeRepo.getAll(),
            units: await di.unitRepo.getAll(),
            time: new Date().getTime(),
            type: "db",
        }

        return JSON.stringify(response);
    }

    @Query(returns => String)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async exportTS(@Arg('id') id: string) {
        const currentUnit = await di.unitRepo.getById(id, ["children"]);

        const units = [currentUnit, ...await currentUnit.getChildren()];
        const unit = units.map(u => u.id);

        const where = {
            ...include({ unit }),
        };

        const response = {
            ts: await di.tsRepo.find({ where, loadRelationIds: true }),
            time: new Date().getTime(),
            type: "ts",
        };

        return JSON.stringify(response);
    }

    @Query(returns => String)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async exportUnit(@Arg('id') id: string) {
        const currentUnit = await di.unitRepo.getById(id, ["children"]);

        const units = [currentUnit, ...await currentUnit.getChildren()];
        const unit = units.map(u => u.id);

        const where = {
            ...include({ unit }),
        };

        const response = {
            ts: await di.tsRepo.find({ where, loadRelationIds: true }),
            tsTypes: await di.tsTypeRepo.getAll(),
            infoTypes: await di.infoTypeRepo.getAll(),
            tables: await di.tableRepo.getAll(),
            tableItems: await di.tableItemRepo.getAll(),
            tsPurposes: await di.tsPurposeRepo.getAll(),
            units: units,
            time: new Date().getTime(),
            type: "db",
        };

        return JSON.stringify(response);
    }

    @Mutation(returns => Boolean)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async wipeUnit(@Arg('id') id: string) {
        const currentUnit = await di.unitRepo.getById(id, ["children"]);

        const units = [currentUnit, ...await currentUnit.getChildren()];

        for (let unit of units) {
            const tsList = await di.tsRepo.find({ where: { unit } })
            await di.tsRepo.remove(tsList);
        }

        return true;
    }

    @Mutation(returns => Boolean)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async wipeDB() {
        await drop(TsType);
        await drop(InfoType);
        await drop(TsPurpose);
        await drop(Unit);
        await drop(Table);
        await drop(TableItem);
        await drop(Ts);

        return true;
    }

    @Mutation(returns => Boolean)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async wipeTS() {
        await drop(Ts);

        return true;
    }

    @Mutation(returns => String)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async importDB(@Arg('input') input: string) {
        const {
            ts,
            tsTypes,
            infoTypes,
            tables,
            tableItems,
            tsPurposes,
            units,
            time,
            type,
        } = JSON.parse(input);

        if ([ts, tsTypes, infoTypes, tables, tableItems, tsPurposes, units, time, type].includes(undefined)) {
            throw new UserInputError('Некорректная структура')
        }

        if (type != "db") {
            throw new UserInputError('Некорректный тип')
        }

        if ([ts, tsTypes, infoTypes, tables, tableItems, tsPurposes, units].filter(e => !Array.isArray(e)).length > 0) {
            throw new UserInputError('Некорректная структура')
        }

        const tsTypeIds = tsTypes.map((e: any) => e.id);
        const infoTypeIds = infoTypes.map((e: any) => e.id);
        const tableIds = tables.map((e: any) => e.id);
        const tableItemIds = tableItems.map((e: any) => e.id);
        const tsPurposeIds = tsPurposes.map((e: any) => e.id);
        const unitIds = units.map((e: any) => e.id);

        const userMap: Record<string, string> = (await di.userRepo.find({ loadRelationIds: true })).reduce((acc, cur) => ({ ...acc, [cur.id]: cur.unit }), {})
        const usersDeprecated = Object.keys(userMap).filter(x => userMap[x]).filter(userId => !unitIds.includes(userMap[userId]))
        if (usersDeprecated.length > 0) {
            throw new UserInputError(`Несовместимые изменения базы.` +
                ` \n\nПользователи: ${(await di.userRepo.getByIdsSafe(usersDeprecated)).map(u => u.username)} зависят от удаляемых подразделений.` +
                ` \n Удалите пользователей или измените привязку к подразделениям`);
        }

        for (const localTs of ts) {
            const {
                number,
                unit,
                tsType,
                tsPurpose,
                infoType,
                receiptYear,
                commissioningYear,
                decommissionYear,
                table,
                tableItem,
                isBroken,
                complectation
            } = localTs;

            if ([number, unit, tsType, tsPurpose, infoType, receiptYear, commissioningYear, decommissionYear, table, tableItem, isBroken, complectation].includes(undefined)) {
                throw new UserInputError('Некорректная структура ТС')
            }

            if (
                !tsTypeIds.includes(tsType) ||
                !infoTypeIds.includes(infoType) ||
                !tableIds.includes(table) ||
                !tableItemIds.includes(tableItem) ||
                !tsPurposeIds.includes(tsPurpose) ||
                !unitIds.includes(unit) ||
                complectation.filter((e: any) => !tsTypeIds.includes(e)).length > 0
            ) {
                throw new UserInputError('Некорректное наполнение ТС')
            }
        }

        await drop(TsType);
        await drop(InfoType);
        await drop(TsPurpose);
        await drop(Unit);
        await drop(Table);
        await drop(TableItem);
        await drop(Ts);

        await save(TsType, tsTypes);
        await save(InfoType, infoTypes);
        await save(TsPurpose, tsPurposes);
        await save(Unit, units);
        await save(Table, tables);
        await save(TableItem, tableItems);
        await save(Ts, await Promise.all(
            ts.map(async (t: any) =>
                ({ ...t, complectation: await di.tsTypeRepo.findByIds(t.complectation) }))));

        for (let userId in userMap) {
            const u = await di.userRepo.getById(userId);
            await u.extend({ unit: await di.unitRepo.getById(userMap[userId]) })
        }

        return time;
    }

    @Mutation(returns => String)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async importDicts(@Arg('input') input: string) {
        const {
            tsTypes,
            infoTypes,
            tables,
            tableItems,
            tsPurposes,
            time,
            type
        } = JSON.parse(input);

        if ([tsTypes, infoTypes, tables, tableItems, tsPurposes, time, type].includes(undefined)) {
            throw new UserInputError('Некорректная структура')
        }

        if (type != "dicts") {
            throw new UserInputError('Некорректный тип')
        }

        await detectDeprecated(TsType, tsTypes, "tsType");
        await detectDeprecated(InfoType, infoTypes, "infoType");
        await detectDeprecated(TsPurpose, tsPurposes, "tsPurpose");
        await detectDeprecated(Table, tables, "table");
        await detectDeprecated(TableItem, tableItems, "tableItem");

        await merge(TsType, tsTypes);
        await merge(InfoType, infoTypes);
        await merge(TsPurpose, tsPurposes);
        await merge(Table, tables);
        await merge(TableItem, tableItems);

        return time;
    }


    @Mutation(returns => String)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async importUnit(@Arg('input') input: string) {
        const {
            ts,
            time,
            type
        } = JSON.parse(input);

        if ([ts, time, type].includes(undefined)) {
            throw new UserInputError('Некорректная структура')
        }

        if (type != "db") {
            throw new UserInputError('Некорректный тип')
        }

        const tsTypeIds = (await di.tsTypeRepo.getAll()).map((e: any) => e.id);
        const infoTypeIds = (await di.infoTypeRepo.getAll()).map((e: any) => e.id);
        const tableIds = (await di.tableRepo.getAll()).map((e: any) => e.id);
        const tableItemIds = (await di.tableItemRepo.getAll()).map((e: any) => e.id);
        const tsPurposeIds = (await di.tsPurposeRepo.getAll()).map((e: any) => e.id);
        const unitIds = (await di.unitRepo.getAll()).map((e: any) => e.id);
        for (const localTs of ts) {
            const {
                number,
                unit,
                tsType,
                tsPurpose,
                infoType,
                receiptYear,
                commissioningYear,
                decommissionYear,
                table,
                tableItem,
                isBroken,
                complectation
            } = localTs;

            if ([number, unit, tsType, tsPurpose, infoType, receiptYear, commissioningYear, decommissionYear, table, tableItem, isBroken, complectation].includes(undefined)) {
                throw new UserInputError('Некорректная структура ТС')
            }

            if (
                !tsTypeIds.includes(tsType) ||
                !infoTypeIds.includes(infoType) ||
                !tableIds.includes(table) ||
                !tableItemIds.includes(tableItem) ||
                !tsPurposeIds.includes(tsPurpose) ||
                !unitIds.includes(unit) ||
                complectation.filter((e: any) => !tsTypeIds.includes(e)).length > 0
            ) {
                throw new UserInputError('Некорректное наполнение ТС')
            }
        }

        const numbers = (await di.tsRepo.find({ where: { unit: Not(In(ts.map((t: any) => t.unit))) } })).map(t => t.number);
        const newNumbers = ts.map((t: any) => t.number);
        const duplicates = numbers.filter(n => newNumbers.includes(n));
        if (duplicates.length > 0) {
            throw new UserInputError(`Найдены дубликаты ТС: ${duplicates}`)
        }

        await mergeConditional(Ts,
            await Promise.all(
                ts.map(async (t: any) =>
                    ({ ...t, complectation: await di.tsTypeRepo.findByIds(t.complectation) }))),
            "unit");

        return time;
    }

    @Mutation(returns => String)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async importTS(
        @Arg('id') id: string,
        @Arg('input') input: string
    ) {
        const {
            ts,
            time,
            type
        } = JSON.parse(input);

        if ([ts, time, type].includes(undefined)) {
            throw new UserInputError('Некорректная структура')
        }

        if (type != "ts") {
            throw new UserInputError('Некорректный тип')
        }

        const tsTypeIds = (await di.tsTypeRepo.getAll()).map((e: any) => e.id);
        const infoTypeIds = (await di.infoTypeRepo.getAll()).map((e: any) => e.id);
        const tableIds = (await di.tableRepo.getAll()).map((e: any) => e.id);
        const tableItemIds = (await di.tableItemRepo.getAll()).map((e: any) => e.id);
        const tsPurposeIds = (await di.tsPurposeRepo.getAll()).map((e: any) => e.id);
        const unitIds = (await di.unitRepo.getAll()).map((e: any) => e.id);
        for (const localTs of ts) {
            const {
                number,
                unit,
                tsType,
                tsPurpose,
                infoType,
                receiptYear,
                commissioningYear,
                decommissionYear,
                table,
                tableItem,
                isBroken,
                complectation
            } = localTs;

            if ([number, unit, tsType, tsPurpose, infoType, receiptYear, commissioningYear, decommissionYear, table, tableItem, isBroken, complectation].includes(undefined)) {
                throw new UserInputError('Некорректная структура ТС')
            }

            if (
                !tsTypeIds.includes(tsType) ||
                !infoTypeIds.includes(infoType) ||
                !tableIds.includes(table) ||
                !tableItemIds.includes(tableItem) ||
                !tsPurposeIds.includes(tsPurpose) ||
                complectation.filter((e: any) => !tsTypeIds.includes(e)).length > 0
            ) {
                throw new UserInputError('Некорректное наполнение ТС')
            }
        }

        const numbers = (await di.tsRepo.find({ where: { unit: Not(id) } })).map(t => t.number);
        const newNumbers = ts.map((t: any) => t.number);
        const duplicates = numbers.filter(n => newNumbers.includes(n));
        if (duplicates.length > 0) {
            throw new UserInputError(`Найдены дубликаты ТС: ${duplicates}`)
        }

        await mergeConditional(Ts,
            await Promise.all(
                ts.map(async (t: any) =>
                    ({ ...t, unit: id, complectation: await di.tsTypeRepo.findByIds(t.complectation) }))),
            "unit");

        return time;
    }
}