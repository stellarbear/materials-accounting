import { MiddlewareFn } from "type-graphql";
import { Context } from "../auxiliary/context";
import { User } from "../entities/user";
import { AuthenticationError } from "apollo-server";

const isAuthenticated: MiddlewareFn<Context> = async ({ context }, next) => {
    const { id } = context.req;
    if (!id) {
        throw new AuthenticationError("not authenticated");
    }

    return next();
}


const isAuthenticatedByRole: (roles: string[] | string) =>
    MiddlewareFn<Context> = (roles: string[] | string) =>
        async ({ context }, next) => {
            const specifiedRoles = Array.isArray(roles) ? roles : [roles];

            const { id } = context.req;
            if (!id) {
                throw new AuthenticationError("not authenticated");
            }

            const user = await User.findOne(id);

            if (!user) {
                throw new AuthenticationError("not authenticated")
            }

            if (!specifiedRoles.includes(user.role)) {
                throw new AuthenticationError("not authorized")
            }

            return next();
        }


export { isAuthenticated, isAuthenticatedByRole };