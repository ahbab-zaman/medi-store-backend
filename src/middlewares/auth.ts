
import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import AppError from "../errors/AppError";
import catchAsync from "../utils/catchAsync";

const auth = (...requiredRoles: string[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError(401, "You are not authorized!");
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new AppError(401, "You are not authorized!");
    }

    let decoded;
    try {
      decoded = jwt.verify(token, config.jwt.secret as string) as JwtPayload;
    } catch (err) {
      throw new AppError(401, "Unauthorized");
    }

    const { role, email } = decoded;

    if (requiredRoles.length > 0 && !requiredRoles.includes(role)) {
      throw new AppError(403, "You are not authorized!");
    }

    req.user = decoded as JwtPayload;
    next();
  });
};
export default auth;
