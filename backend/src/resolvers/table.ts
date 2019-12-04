import { Resolver, Query, Mutation, Arg, Field, InputType, UseMiddleware } from "type-graphql";
import { Table, Ts, TableItem } from "../entities";
import { ExtError } from "../helpers/error";
import { di } from "../repositories";
import { In } from "typeorm";
import { ReturnType } from "./returnType";
import { isAuthenticated, isAuthenticatedByRole } from "../middleware/isAuthenticated";

@InputType()
export class TableItemInput {
    @Field(type => String, { nullable: true })
    id: string;

    @Field(type => String)
    name: string;
}

@Resolver()
export class TablesResolver {
    @Query(returns => [Table])
    @UseMiddleware(isAuthenticated)
    async allTables(): Promise<Table[]> {
        const response = await di.tableRepo.getAll(["items"]);

        return response;
    }

    @Query(returns => Table)
    @UseMiddleware(isAuthenticated)
    async getTable(@Arg('id') id: string): Promise<Table> {
        const table = await di.tableRepo.getById(id, ["items"]);

        return table;
    }

    @Mutation(returns => Table)
    @UseMiddleware(isAuthenticatedByRole("admin"))
    async createTable(
        @Arg('name') name: string,
        @Arg('items', type => [TableItemInput], { nullable: true }) items: TableItemInput[]
    ): Promise<Table> {
        if (await di.tableRepo.checkIfExist({ name })) {
            throw new ExtError({ code: "Запись с таким именем уже существует" })
        }

        const tableItems: TableItem[] = await Promise.all(items.map(async item => {
            const result = new TableItem();
            await result.extend({ ...item });
            return result;
        }));

        const table = new Table();
        await table.extend({ name, items: tableItems })

        return table;
    }

    @Mutation(returns => Table)
    @UseMiddleware(isAuthenticatedByRole("admin"))
    async updateTable(
        @Arg('id') id: string,
        @Arg('name') name: string,
        @Arg('items', type => [TableItemInput], { nullable: true }) items: TableItemInput[]
    ): Promise<Table> {
        if (await di.tableRepo.checkIfExistAndNotTheSame({ name }, id)) {
            throw new ExtError({ code: "Запись с таким именем уже существует" })
        }

        const table: Table = await di.tableRepo.findOne({ where: { id }, relations: ["items"] });
        const oldItemsIds = table.items.map(i => i.id);
        const newItemsIds = items.map(i => i.id);

        const tableItemsToDeleteIds = oldItemsIds.filter(t => !newItemsIds.includes(t));
        const tableItemsToAdd = items.filter(t => !oldItemsIds.includes(t.id));
        const tableItemsToModify = items.filter(t => oldItemsIds.includes(t.id));

        const tsList = await di.tsRepo.find({ where: { tableItem: In(tableItemsToDeleteIds) }, loadRelationIds: true });
        if (tsList.length) {
            throw new ExtError({ code: 'Невозможно удалить данный пункт табеля, т.к. найдены ТС, относящиеся к нему!', field: 'tableItems' })
        }

        await di.tableItemRepo.remove(await di.tableItemRepo.findByIds(tableItemsToDeleteIds));

        const tableItemsNew = await Promise.all(tableItemsToAdd.map(async item => {
            const result = new TableItem();
            await result.extend({ ...item });
            return result;
        }));

        const tableItemsModified = await Promise.all(tableItemsToModify.map(async item => {
            const result = await di.tableItemRepo.getById(item.id);
            await result.extend({ ...item });
            return result;
        }));

        await table.extend({ name, items: [...tableItemsModified, ...tableItemsNew] })

        return table;
    }

    @Mutation(returns => ReturnType)
    @UseMiddleware(isAuthenticatedByRole("admin"))
    async deleteTable(@Arg('id') id: string): Promise<ReturnType> {
        const table = await di.tableRepo.getById(id, ["items"]);

        if (await di.tsRepo.checkIfExist({ table })) {
            throw new ExtError({ code: 'Невозможно удалить данную запись, т.к. найдены ТС, относящиеся к ней!' })
        }

        await di.tableItemRepo.remove(table.items);
        await di.tableRepo.remove(table)
        await di.tableItemRepo.remove(table.items);

        return ({
            id,
            status: "OK"
        });
    }
}