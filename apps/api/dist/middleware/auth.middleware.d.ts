import { RequestHandler } from "express";
import { UserRole } from "@prisma/client";
export declare const authenticate: RequestHandler;
export declare const authorize: (allowedRoles: UserRole[]) => RequestHandler;
//# sourceMappingURL=auth.middleware.d.ts.map