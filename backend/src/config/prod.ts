import { IKeys } from "."

const keys: IKeys = {
    secret: {
        refresh: process.env.REFRESH_SECRET || "TDhl8Rr8AA_?US8@s,",
        access: process.env.ACCESS_SECRET || "+DW<H@qIFlC[*!G0o%",
    }
}

export default keys