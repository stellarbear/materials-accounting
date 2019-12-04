import { Resolver, Query, Arg, Mutation, Ctx, ObjectType, Field, Int, UseMiddleware } from "type-graphql";
import { User, InfoType } from "../entities";
import { di } from "../repositories";
import { UserRepository, UnitRepository } from "../repositories";
import { ExtError } from "../helpers/error";
import { ReturnType } from "./returnType";
import { v4 } from "uuid";
import bcrypt = require('bcryptjs');
import { createRefreshToken, createAccessToken, wipeTokens } from "../auxiliary/token";
import { isAuthenticatedByRole } from "../middleware/isAuthenticated";

@ObjectType()
class AuthPayload {
    @Field(type => String)
    token: string;

    @Field(type => User)
    user: User;
}

@Resolver()
export class UserResolver {
    @Query(returns => [User])
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async allUsers(): Promise<User[]> {
        const response = await di.userRepo.getAll(["unit"]);

        return response;
    }

    @Query(returns => User)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async getUser(@Arg('id') id: string): Promise<User> {
        const response = await di.userRepo.getById(id, ["unit"]);

        return response;
    }

    @Mutation(returns => Boolean)
    async logout(
        @Ctx() ctx: Record<string, any>,
    ): Promise<boolean> {
        wipeTokens(ctx.res);

        return true;
    }

    @Mutation(returns => AuthPayload)
    async login(
        @Arg('username') username: string,
        @Arg('password') password: string,
        @Ctx() ctx: Record<string, any>,
    ): Promise<AuthPayload> {
        const user = await di.userRepo.findOne({ where: { username } });
        if (!user) {
            throw new ExtError({ code: 'Username or password incorrect' });
        }
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            throw new ExtError({ code: 'Username or password incorrect' });
        }

        ctx.res.cookie("refresh-token", createRefreshToken(user));
        ctx.res.cookie("access-token", createAccessToken(user));

        return {
            token: user.session,
            user
        };
    }


    @Mutation(returns => Boolean)
    async userInvalidate(@Ctx() ctx: Record<string, any>): Promise<boolean> {
        const { id } = ctx.req;

        if (!id) {
            return false;
        }

        const user = await di.userRepo.findOne(id);
        if (!user) {
            return false;
        }

        user.session = v4();
        await user.save();

        return true;
    }

    @Mutation(returns => User)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async createUser(
        @Arg('username') username: string,
        @Arg('password') password: string,
        @Arg('unit', { nullable: true }) unit: string,
        @Arg('role') role: string,
    ): Promise<User> {
        if (await di.userRepo.checkIfExist({ username })) {
            throw new ExtError({ code: "Пользователь с таким логином уже существует", field: "username" })
        }

        const session = v4();
        const salt = bcrypt.genSaltSync(10);
        password = await bcrypt.hash(password, salt);

        const user = new User();
        await user.extend({
            username: username,
            password,
            session,
            salt,
            unit: await di.unitRepo.getById(unit, ["parent"]),
            role: username === 'root' ? 'admin' : role,
        });

        return user;
    }

    @Mutation(returns => User)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async updateUser(
        @Arg('id') id: string,
        @Arg('username') username: string,
        @Arg('password') password: string,
        @Arg('unit', { nullable: true }) unit: string,
        @Arg('role') role: string,
    ): Promise<User> {
        if (await di.userRepo.checkIfExistAndNotTheSame({ username }, id)) {
            throw new ExtError({ code: "Пользователь с таким логином уже существует", field: "username" })
        }

        const user = await di.userRepo.getById(id);
        await user.extend({
            username,
            unit: await di.unitRepo.getById(unit, ["parent"]),
            role: username === 'root' ? 'admin' : role,
            password: await bcrypt.hash(password, user.salt),
        });

        return user;
    }

    @Mutation(returns => ReturnType)
    @UseMiddleware(isAuthenticatedByRole(["admin"]))
    async deleteUser(
        @Ctx() ctx: Record<string, any>,
        @Arg('id') id: string): Promise<ReturnType> {
        const user = await di.userRepo.getById(id);

        if (user.username === 'root') {
            throw new ExtError({ code: 'Вы не можете удалить пользователя root!' });
        }
        if (user.role === 'admin') {
            throw new ExtError({ code: 'Вы не можете удалить пользователя с правами администратора!' });
        }

        await user.remove();
        return ({
            id,
            status: "OK"
        });
    }
}