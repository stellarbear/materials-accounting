import { Resolver, Query, Mutation, Arg, InputType, Field, ObjectType, UseMiddleware } from "type-graphql";
import { InfoType, Ts } from "../entities";
import { di } from "../repositories";
import { ExtError } from "../helpers/error";
import { ReturnType } from "./returnType";
import { isAuthenticated, isAuthenticatedByRole } from "../middleware/isAuthenticated";

@Resolver()
export class InfoTypesResolver {
    @Query(returns => [InfoType])
    @UseMiddleware(isAuthenticated)
    async allInfoTypes(): Promise<InfoType[]> {
        const response = await di.infoTypeRepo.getAll();

        return response;
    }

    @Mutation(returns => InfoType)
    @UseMiddleware(isAuthenticatedByRole("admin"))
    async createInfoType(@Arg('name') name: string): Promise<InfoType> {
        if (await di.infoTypeRepo.checkIfExist({ name })) {
            throw new ExtError({ code: "Запись с таким именем уже существует" })
        }

        const infoType = new InfoType();
        await infoType.extend({ name })

        return infoType;
    }

    @Mutation(returns => InfoType)
    @UseMiddleware(isAuthenticatedByRole("admin"))
    async updateInfoType(
        @Arg('id') id: string,
        @Arg('name') name: string
    ): Promise<InfoType> {
        if (await di.infoTypeRepo.checkIfExistAndNotTheSame({ name }, id)) {
            throw new ExtError({ code: "Запись с таким именем уже существует" })
        }

        const infoType = await di.infoTypeRepo.getById(id);
        await infoType.extend({ name });

        return infoType;
    }

    @Mutation(returns => ReturnType)
    @UseMiddleware(isAuthenticatedByRole("admin"))
    async deleteInfoType(@Arg('id') id: string): Promise<ReturnType> {
        const infoType = await di.infoTypeRepo.getById(id);

        if (await di.tsRepo.checkIfExist({ infoType })) {
            throw new ExtError({ code: 'Невозможно удалить данную запись, т.к. найдены ТС, относящиеся к ней!' })
        }

        await infoType.remove();
        return ({
            id,
            status: "OK"
        });
    }
}