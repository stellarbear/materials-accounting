import development from "./dev";
import production from "./prod";

export interface IKeys {
    secret: {
        refresh: string;
        access: string;
    }
}

const keys: IKeys = process.env.NODE_ENV === "production" ? production : development;

export { keys };