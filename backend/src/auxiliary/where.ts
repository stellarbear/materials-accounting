import { LooseObject } from "./looseObject";
import { Like, BaseEntity, Between, In } from "typeorm";

const include = (object: LooseObject): any =>
    Object.keys(object)
        .reduce((acc, cur) =>
            object[cur] == undefined || !object[cur].length
                ? acc
                : ({ ...acc, [cur]: In(object[cur]) })
            , {});

const like = (object: LooseObject): any =>
    Object.keys(object)
        .reduce((acc, cur) =>
            object[cur] == undefined
                ? acc
                : ({ ...acc, [cur]: Like(`%${object[cur]}%`) })
            , {});

const between = (object: LooseObject, from: string = "from", to: string = "to"): any =>
    Object.keys(object)
        .reduce((acc: any, cur: any) => {
            if (object[cur] == undefined) {
                return acc;
            }

            if (object[cur] && from in object[cur] && to in object[cur]) {
                acc[cur] = Between(object[cur][from], object[cur][to]);
            }

            return acc;
        }, {});

const set = (object: LooseObject): any =>
    Object.keys(object)
        .reduce((acc, cur) =>
            object[cur] === undefined
                ? acc
                : ({ ...acc, [cur]: object[cur] })
            , {});

const extend = <T extends BaseEntity>(src: T, object: LooseObject) =>
    Object.keys(object)
        .reduce((acc, cur) => {
            if (object[cur] !== undefined) {
                (acc as any)[cur] = object[cur]
            }
            return acc;
        }, src);
export { like, set, extend, between, include }