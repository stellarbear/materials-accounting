import { ApolloServer } from "apollo-server-express";

import { User } from "./entities";

import { verify } from "jsonwebtoken";
import { Request, Response } from "express";

import express = require('express');
import cookieParser = require('cookie-parser');

import { createRefreshToken, createAccessToken, wipeTokens } from "./auxiliary/token";
import { GraphQLSchema } from "graphql";
import { keys } from "./config";

export const server = async (schema: GraphQLSchema) => {
    const apolloServer = new ApolloServer({
        schema,
        context: ({ req, res }) => ({ req, res }),
        introspection: true,
        playground: true,
    });

    const app = express();
    app.use(cookieParser());
    //app.use(cors(corsOptions));
    app.use(async (req: Request, res: Response, next) => {
        const refreshToken = req.cookies["refresh-token"];
        const accessToken = req.cookies["access-token"];

        //  If one or more token missing
        if (!refreshToken || !accessToken) {
            return next();
        }

        //  Both tokens present
        try {
            //  Trying to verify access token
            const accessData = verify(accessToken, keys.secret.access) as any;
            req.id = accessData.id;

            console.log("access token valid");
        } catch {
            //  Access token invalid or expired, refresh token present
            try {
                //  Trying to verify refresh token
                const refreshData = verify(refreshToken, keys.secret.refresh) as any;

                //  Verify that refresh token is still valid
                const user = await User.findOne(refreshData.id);
                if (!user || user.session !== refreshData.session) {
                    //  Note: we will get here only after access token expiration
                    console.log("verify token expired");
                    wipeTokens(res);
                    return next();
                }

                //  Valid refresh token, updating both tokens
                console.log("access token expired, but refresh token is valid");
                res.cookie("refresh-token", createRefreshToken(user));
                res.cookie("access-token", createAccessToken(user));
                console.log("updating both tokens");
                req.id = user.id;
            } catch {
                console.log("verify token invalid");
                //  In order to stop keep-alive dos
                wipeTokens(res);
            }
        }

        return next();
    });

    const port = parseInt(process.env.GRAPHQL_PORT, 10) || 4000;
    const hostname = process.env.GRAPHQL_HOST || "localhost";
    const endpoint = process.env.GRAPHQL_ENDPOINT || "graphql";

    apolloServer.applyMiddleware({
        app,
        cors: {
            credentials: true,
            origin: true
        },
        path: `/${endpoint}`,
    });

    app.listen(port, hostname, () => console.log(`> Server is running on http://localhost:${port}/${endpoint}`))
}
