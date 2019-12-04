import { TsResolver } from './ts';
import { UserResolver } from './user';
import { UnitResolver } from './unit';
import { TablesResolver } from './table';
import { TsTypeResolver } from './tsType';
import { InfoTypesResolver } from './infoType';
import { TsPurposeResolver } from './tsPurpose';
import { ManagementResolver } from './management';

export default [
    ManagementResolver,
    UserResolver, TsResolver, UnitResolver, TsPurposeResolver, TsTypeResolver,
    InfoTypesResolver,
    TablesResolver
];