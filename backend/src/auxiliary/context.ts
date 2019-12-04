import { Request, Response } from "express";

declare module "express" {
	export interface Request {
		id?: string;
	}
}

export interface Context {
	req: Request;
	res: Response;
}