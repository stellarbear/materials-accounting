import { sign } from "jsonwebtoken";
import { User } from "../entities/user";
import { Response } from "express";
import { keys } from "../config";

const createAccessToken = (user: User): string => {
	const { id } = user;
	const accessExpire = 10;
	const accessToken = sign({ id }, keys.secret.access, { expiresIn: accessExpire });

	return accessToken;
};

const createRefreshToken = (user: User): string => {
	const { id, session } = user;
	const refreshExpire = 60 * 60 * 24 * 30;
	const refreshToken = sign({ id, session }, keys.secret.refresh, { expiresIn: refreshExpire });

	return refreshToken;
};

const wipeTokens = (res: Response): void => {
	res.clearCookie("refresh-token");
	res.clearCookie("access-token");
}

export { createAccessToken, createRefreshToken, wipeTokens }