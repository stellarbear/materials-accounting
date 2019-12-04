import { Resolver, Query, Arg, Mutation, UseMiddleware } from "type-graphql";
import { TsType, Ts } from "../entities";
import { UserInputError } from "apollo-server";
import { di } from "../repositories";
import { TsTypeRepository, TsRepository } from "../repositories";
import { ExtError } from "../helpers/error";
import { ReturnType } from "./returnType";
import { isAuthenticated, isAuthenticatedByRole } from "../middleware/isAuthenticated";

@Resolver()
export class TsTypeResolver {
    @Query(returns => [TsType])
    @UseMiddleware(isAuthenticated)
    async allTsTypes(): Promise<TsType[]> {
        const response = await di.tsTypeRepo.getAll();

        return response;
    }

    @Mutation(returns => TsType)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async createTsType(
        @Arg('name') name: string,
        @Arg('withComplectation') withComplectation: boolean
    ): Promise<TsType> {
        if (await di.tsTypeRepo.checkIfExist({ name })) {
            throw new ExtError({ code: "Запись с таким именем уже существует" })
        }

        const tsType = new TsType();
        await tsType.extend({ name, withComplectation })

        return tsType;
    }

    @Mutation(returns => TsType)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async updateTsType(
        @Arg('id') id: string,
        @Arg('name') name: string,
        @Arg('withComplectation') withComplectation: boolean): Promise<TsType> {

        if (await di.tsTypeRepo.checkIfExistAndNotTheSame({ name }, id)) {
            throw new ExtError({ code: "Запись с таким именем уже существует" })
        }

        const tsType = await di.tsTypeRepo.getById(id);
        await tsType.extend({ name, withComplectation });

        return tsType;
    }

    @Mutation(returns => ReturnType)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async deleteTsType(@Arg('id') id: string): Promise<ReturnType> {
        const tsType = await di.tsTypeRepo.getById(id);
        
        if (await di.tsRepo.checkIfExist({ tsType })) {
            throw new ExtError({ code: 'Невозможно удалить данную запись, т.к. найдены ТС, относящиеся к ней!' })
        }

        //  TODO: prettify
        const complectationList = (await di.tsRepo.find({ relations: ["complectation"] }))
            .flatMap(ts => ts.complectation);

        if (complectationList.includes(tsType)) {
            throw new UserInputError('Невозможно удалить данный тип ТС, т.к. найдены ТС (из комплектации), относящиеся к нему!');
        }

        await tsType.remove();
        return ({
            id,
            status: "OK"
        });
    }
}