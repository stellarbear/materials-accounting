import { UserInputError } from "apollo-server";

interface IError {
    code: string;
    field?: string;
}

class ExtError extends UserInputError {
    constructor({ code, field = "default" }: IError) {
        super(code);
        this.extensions.exception = {};
        this.extensions.exception.field = field;
    }
}

export { ExtError, IError }