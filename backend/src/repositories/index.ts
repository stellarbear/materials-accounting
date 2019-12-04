import { EntityRepository, TreeRepository } from "typeorm";
import { InfoType, Table, TableItem, Ts, TsPurpose, TsType, Unit, User } from "../entities";
import { BaseRepository } from "./base";
import { getCustomRepository } from "typeorm";

@EntityRepository(InfoType)
export class InfoTypeRepository extends BaseRepository<InfoType> { }

@EntityRepository(Table)
export class TableRepository extends BaseRepository<Table> { }

@EntityRepository(TableItem)
export class TableItemRepository extends BaseRepository<TableItem> { }

@EntityRepository(Ts)
export class TsRepository extends BaseRepository<Ts> { }

@EntityRepository(TsPurpose)
export class TsPurposeRepository extends BaseRepository<TsPurpose> { }

@EntityRepository(TsType)
export class TsTypeRepository extends BaseRepository<TsType> { }

@EntityRepository(Unit)
export class UnitRepository extends BaseRepository<Unit> { }

@EntityRepository(User)
export class UserRepository extends BaseRepository<User> { }

class Container {
    private _infoTypeRepo: InfoTypeRepository;
    private _tableRepo: TableRepository;
    private _tableItemRepo: TableItemRepository;
    private _tsRepo: TsRepository;
    private _tsPurposeRepo: TsPurposeRepository;
    private _tsTypeRepo: TsTypeRepository;
    private _unitRepo: UnitRepository;
    private _userRepo: UserRepository;

    public get infoTypeRepo() {
        return this._infoTypeRepo || getCustomRepository(InfoTypeRepository);
    }
    public get tableRepo() {
        return this._tableRepo || getCustomRepository(TableRepository);
    }
    public get tableItemRepo() {
        return this._tableItemRepo || getCustomRepository(TableItemRepository);
    }
    public get tsRepo() {
        return this._tsRepo || getCustomRepository(TsRepository);
    }
    public get tsPurposeRepo() {
        return this._tsPurposeRepo || getCustomRepository(TsPurposeRepository);
    }
    public get tsTypeRepo() {
        return this._tsTypeRepo || getCustomRepository(TsTypeRepository);
    }
    public get unitRepo() {
        return this._unitRepo || getCustomRepository(UnitRepository);
    }
    public get userRepo() {
        return this._userRepo || getCustomRepository(UserRepository);
    }
}

const di = new Container();

export { di };