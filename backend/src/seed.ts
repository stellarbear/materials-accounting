import { InfoType, TsType, TsPurpose, Unit, Table, TableItem, Ts, User } from "./entities";
import { BaseEntity } from "typeorm";
import { Base } from "./entities/base";
import { v4 } from "uuid";
import bcrypt = require('bcryptjs');
import { di } from "./repositories";

const create = async <T extends Base>(type: { new(): T; }, params: Record<string, any>): Promise<T> => {
    const entity = new type();

    await entity.extend(params);

    return entity;
}

const seed = async () => {
    console.log('Seeding data!');

    if (await di.userRepo.findOne({ where: { username: "root" } }) == undefined) {
        const rootSession = v4();
        const rootSalt = bcrypt.genSaltSync(10);
        const rootPassword = await bcrypt.hash("1qaz2wsx", rootSalt);
        const root = await create(User, { username: "root", password: rootPassword, salt: rootSalt, session: rootSession, role: "admin" })

        const modSession = v4();
        const modSalt = bcrypt.genSaltSync(10);
        const modPassword = await bcrypt.hash("asdqwe123", modSalt);
        const mod = await create(User, { username: "mod", password: modPassword, salt: modSalt, session: modSession, role: "moderator" })
    }

    if (false) {

        const session = v4();
        const salt = bcrypt.genSaltSync(10);
        const password = await bcrypt.hash("1qaz2wsx", salt);
        const root = await create(User, { username: "root", password, salt, session, role: "admin" })

        const infoTypes = [
            await create(InfoType, { name: 'ДСП' }),
            await create(InfoType, { name: 'С' }),
            await create(InfoType, { name: 'СС' }),
            await create(InfoType, { name: 'ОВ' }),
        ];
        const tsTypes = [
            await create(TsType, { name: 'Офисное СВТ', withComplectation: true }),
            await create(TsType, { name: 'Графическая станция', withComplectation: true }),
            await create(TsType, { name: 'Сетевой принтер ч/б А4' }),
            await create(TsType, { name: 'Сетевой принтер цв. А4' }),
            await create(TsType, { name: 'Сетевой принтер цв. А3' }),
            await create(TsType, { name: 'Плоттер А0' }),
            await create(TsType, { name: 'Сканер А3' }),
            await create(TsType, { name: 'Сканер А4' }),
            await create(TsType, { name: 'ИБП' }),
            await create(TsType, { name: 'Внешний НЖМД' }),
            await create(TsType, { name: 'Флеш-накопитель' }),
            await create(TsType, { name: 'Сервер' }),
            await create(TsType, { name: 'Бумагорезательная машина' }),
            await create(TsType, { name: 'Копировально-множительный аппарат А4' }),
            await create(TsType, { name: 'Копировально-множительный аппарат А3' })
        ];

        const tsPurposes = [
            await create(TsPurpose, { name: 'Подготовка документов' }),
            await create(TsPurpose, { name: 'Настройка аппаратуры' }),
            await create(TsPurpose, { name: 'Работа в составе комплекса' })
        ]

        const items1 = [
            await create(TableItem, { name: 'Т1.П1' }),
            await create(TableItem, { name: 'Т1.П2' }),
        ]
        const items2 = [
            await create(TableItem, { name: 'Т2.П1' }),
            await create(TableItem, { name: 'Т2.П2' }),
        ]
        const tables = [
            await create(Table, { name: 'Табель1', items: items1 }),
            await create(Table, { name: 'Табель2', items: items2 }),
        ]

        const u1 = await create(Unit, { name: '1 отдел', parent: null });
        const u2 = await create(Unit, { name: '2 отдел', parent: null });
        const u3 = await create(Unit, { name: '3 отдел', parent: null });
        const u21 = await create(Unit, { name: '1 отделение', parent: u2 });
        const u22 = await create(Unit, { name: '2 отделение', parent: u2 });
        const u23 = await create(Unit, { name: '3 отделение', parent: u2 });
        const u211 = await create(Unit, { name: '1 группа', parent: u21 });
        const u2111 = await create(Unit, { name: '1 отряд', parent: u211 });
        const u212 = await create(Unit, { name: '2 группа', parent: u21 });
        const u221 = await create(Unit, { name: '1 группа', parent: u22 });
        const u31 = await create(Unit, { name: '1 отделение', parent: u3 });
        const u32 = await create(Unit, { name: '2 отделение', parent: u3 });
        u1.getFullPath();
        u2.getFullPath();
        u3.getFullPath();


        const sessionU = v4();
        const saltU = bcrypt.genSaltSync(10);
        const passwordU = await bcrypt.hash("111111", salt);
        const user = await create(User, { username: "user", password: passwordU, salt: saltU, session: sessionU, role: "user", unit: u21 })

        const t1 = await create(Ts, {
            number: "12345",
            unit: u1,
            infoType: infoTypes[0],
            complectation: [],
            tsType: tsTypes[2],
            receiptYear: 2014,
            commissioningYear: null,
            decommissionYear: null,
            table: tables[0],
            tableItem: items1[0],
            isBroken: false,
            tsPurpose: tsPurposes[0],
        })
        const t2 = await create(Ts, {
            number: "12355",
            unit: u211,
            infoType: infoTypes[1],
            complectation: [tsTypes[5], tsTypes[9], tsTypes[10]],
            tsType: tsTypes[2],
            receiptYear: 2015,
            commissioningYear: 2016,
            decommissionYear: null,
            table: tables[1],
            tableItem: items2[0],
            isBroken: false,
            tsPurpose: tsPurposes[0],
        })
        const t3 = await create(Ts, {
            number: "18961",
            unit: u2111,
            infoType: infoTypes[2],
            complectation: [tsTypes[5], tsTypes[9]],
            tsType: tsTypes[0],
            receiptYear: 2014,
            commissioningYear: 2017,
            decommissionYear: 2018,
            table: tables[0],
            tableItem: items1[1],
            isBroken: false,
            tsPurpose: tsPurposes[1],
        })
        const t4 = await create(Ts, {
            number: "18416",
            unit: u211,
            infoType: infoTypes[3],
            complectation: [],
            tsType: tsTypes[6],
            receiptYear: 2014,
            commissioningYear: 2019,
            decommissionYear: null,
            table: tables[1],
            tableItem: items2[1],
            isBroken: true,
            tsPurpose: tsPurposes[2],
        })
        const t5 = await create(Ts, {
            number: "55555",
            unit: u2,
            infoType: infoTypes[0],
            complectation: [],
            tsType: tsTypes[2],
            receiptYear: 2014,
            commissioningYear: null,
            decommissionYear: null,
            table: tables[1],
            tableItem: items2[1],
            isBroken: false,
            tsPurpose: tsPurposes[0],
        })
    }

    console.log('Seeding done!');
}

export { seed };