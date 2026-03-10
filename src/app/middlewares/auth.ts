import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import catchAsync from "../utils/catchAsync";
import AppError from "../errors/handleAppError";
import config from "../config";
import { UserModel } from "../modules/user/user.model";
import { TUserRole } from "../modules/user/user.interface";

const auth = (...requiredRoles: TUserRole[]) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Check for token in authorization header or cookie
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;
    const cookieToken = req.cookies?.accessToken || req.cookies?.token;
    const token = bearerToken || cookieToken;

    if (!token) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized !");
    }

    let decoded = {} as JwtPayload;
    try {
      decoded = jwt.verify(
        token as string,
        config.jwt_access_secret as string
      ) as JwtPayload;
    } catch (error) {
      throw new AppError(401, "Unauthorized !");
    }

    const user = await UserModel.findOne({ email: decoded?.email });

    if (!user) {
      throw new AppError(404, "The user is not found !");
    }

    const isDeleted = user?.status === "banned";
    if (isDeleted) {
      throw new AppError(400, "The user is banned !");
    }

    if (requiredRoles.length && !requiredRoles.includes(user.role as TUserRole)) {
      throw new AppError(httpStatus.UNAUTHORIZED, "You are not authorized !");
    }

    req.user = decoded as JwtPayload;

    next();
  });
};

export default auth;
