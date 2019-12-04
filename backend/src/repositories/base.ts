import { Repository, Not } from "typeorm";
import { UserInputError } from "apollo-server";
import { ExtError } from "../helpers/error";

export class BaseRepository<Entity> extends Repository<Entity> {
	async getByIdsUnSafe(ids: any[] | undefined, relations: string[] = []): Promise<Entity[]> {
		const result = await super.findByIds(ids || [], { relations })

		return result.length ? result : undefined;
	}
	async getByIdsSafe(ids: any[] | undefined, relations: string[] = []): Promise<Entity[]> {
		const result = await super.findByIds(ids || [], { relations })

		return result;
	}
	async getById(id: any | undefined, relations: string[] = []): Promise<Entity | undefined> {
		if (id == undefined) {
			return undefined;
		}
		const result = await super.findOne({ where: { id }, relations })

		return result;
	}

	async getAll(relations: string[] = []): Promise<Entity[]> {
		const conditions = relations.length == 0 ? { loadRelationIds: true } : { relations };
		const result = await super.find(conditions);

		return result;
	}

	async checkIfExist(input: { [key: string]: any }, relations: string[] = []) {
		const result = await super.findOne({ where: { ...input }, relations });
		return !!result;
	}
	async checkIfExistAndNotTheSame(input: { [key: string]: any }, id: string, relations: string[] = []) {
		const result = await super.findOne({ where: { ...input, id: Not(id) }, relations });
		return !!result;
	}
}