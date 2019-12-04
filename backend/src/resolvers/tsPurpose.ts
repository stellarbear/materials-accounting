import { Resolver, Query, Arg, Mutation, UseMiddleware } from "type-graphql";
import { TsPurpose, Ts } from "../entities";
import { di } from "../repositories";
import { TsPurposeRepository, TsRepository } from "../repositories";
import { ExtError } from "../helpers/error";
import { ReturnType } from "./returnType";
import { isAuthenticated, isAuthenticatedByRole } from "../middleware/isAuthenticated";

@Resolver()
export class TsPurposeResolver {
    @Query(returns => [TsPurpose])
    @UseMiddleware(isAuthenticated)
    async allTsPurposes(): Promise<TsPurpose[]> {
        const response = await di.tsPurposeRepo.getAll();

        return response;
    }

    @Mutation(returns => TsPurpose)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async createTsPurpose(@Arg('name') name: string): Promise<TsPurpose> {
        if (await di.tsPurposeRepo.checkIfExist({ name })) {
            throw new ExtError({ code: "Запись с таким именем уже существует" })
        }

        const tsPurpose = new TsPurpose();
        await tsPurpose.extend({ name })

        return tsPurpose;
    }

    @Mutation(returns => TsPurpose)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async updateTsPurpose(
        @Arg('id') id: string,
        @Arg('name') name: string): Promise<TsPurpose> {
        if (await di.tsPurposeRepo.checkIfExistAndNotTheSame({ name }, id)) {
            throw new ExtError({ code: "Запись с таким именем уже существует" })
        }

        const tsPurpose = await di.tsPurposeRepo.getById(id);
        await tsPurpose.extend({ name });
        
        return tsPurpose;
    }

    @Mutation(returns => ReturnType)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async deleteTsPurpose(@Arg('id') id: string): Promise<ReturnType> {
        const tsPurpose = await di.tsPurposeRepo.getById(id);

        if (await di.tsRepo.checkIfExist({ tsPurpose })) {
            throw new ExtError({ code: 'Невозможно удалить данную запись, т.к. найдены ТС, относящиеся к ней!' })
        }

        await tsPurpose.remove();
        return ({
            id,
            status: "OK"
        });
    }
}