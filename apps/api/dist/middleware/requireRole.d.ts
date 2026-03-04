import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "../types/auth-request";
export declare const requireRole: (allowedRoles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=requireRole.d.ts.map