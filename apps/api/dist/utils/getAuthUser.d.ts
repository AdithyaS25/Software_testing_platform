import { AuthenticatedRequest } from "../types/auth-request";
export declare function getAuthUser(req: AuthenticatedRequest): {
    id: string;
    email: string;
    role: import("@prisma/client").UserRole;
};
//# sourceMappingURL=getAuthUser.d.ts.map