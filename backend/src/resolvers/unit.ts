import { Resolver, Query, Arg, Mutation, FieldResolver, Root, UseMiddleware, Ctx } from "type-graphql";
import { Unit, Ts } from "../entities";
import { UserInputError } from "apollo-server";
import { di } from "../repositories";
import { UnitRepository, TsRepository } from "../repositories";
import { ExtError } from "../helpers/error";
import { ReturnType } from "./returnType";
import { isAuthenticated, isAuthenticatedByRole } from "../middleware/isAuthenticated";

const relations = ["parent", "children"]

@Resolver(of => Unit)
export class UnitResolver {
    @Query(returns => [Unit])
    @UseMiddleware(isAuthenticated)
    async allUnits(@Ctx() ctx: Record<string, any>): Promise<Unit[]> {
        const { id: userId } = ctx.req;
        const { unit } = await di.userRepo.getById(userId, ["unit"]);

        if (unit) {
            const units = [unit, ...await unit.getChildren()];
            return units;
        }

        const response = await di.unitRepo.getAll(relations);
        return response;
    }

    @Query(returns => Unit, { nullable: true })
    @UseMiddleware(isAuthenticated)
    async getUnit(@Arg('id') id: string): Promise<Unit> {
        const response = await di.unitRepo.getById(id, relations);

        return response;
    }

    @Mutation(returns => Unit)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async createUnit(
        @Arg('name') name: string,
        @Arg('parent', { nullable: true }) parent: string): Promise<Unit> {

        if (await di.unitRepo.checkIfExist({ name })) {
            throw new ExtError({ code: "Запись с таким именем уже существует" })
        }
        if (!name && !await di.unitRepo.checkIfExist({ id: parent })) {
            throw new ExtError({ code: 'Родительского подразделения не существует!' })
        }

        const unit = new Unit();
        await unit.extend({
            name,
            parent: await di.unitRepo.getById(parent, relations)
        })
        unit.getFullPath();

        return unit;
    }

    @Mutation(returns => Unit, { nullable: true })
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async updateUnit(
        @Arg('id') id: string,
        @Arg('name') name: string,
        @Arg('parent', { nullable: true }) parent: string): Promise<Unit> {
        const parentUnit = await di.unitRepo.getById(parent);

        if (await di.unitRepo.checkIfExistAndNotTheSame({ name, parent: parentUnit }, id)) {
            throw new ExtError({ code: 'Подразделение с таким именем уже существует!' })
        }

        const unit = await di.unitRepo.getById(id);
        const parents = await unit.getParents();
        if (parents.includes(unit)) {
            throw new UserInputError('Такое изменение создаст кольцо в структуре подразделений!');
        }

        await unit.extend({ name, parent: parentUnit })
        unit.getFullPath();

        return unit;
    }

    @Mutation(returns => ReturnType)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async deleteUnit(@Arg('id') id: string): Promise<ReturnType> {
        const unit = await di.unitRepo.findOne({ where: { id }, loadRelationIds: true });

        if (await di.tsRepo.checkIfExist({ unit })) {
            throw new ExtError({ code: 'Невозможно удалить данную запись, т.к. найдены ТС, относящиеся к ней!' })
        }
        if (unit.children.length > 0) {
            throw new UserInputError('Невозможно удалить данное подразделение, т.к. оно является родительским для другого подразделения!');
        }

        await unit.remove();
        return ({
            id,
            status: "OK"
        });
    }
}