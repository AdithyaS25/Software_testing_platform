import jwt from "jsonwebtoken";
export declare const verifyRefreshToken: (token: string) => {
    sub: string;
    email?: string;
    role?: string;
};
export declare function signAccessToken(payload: object): string;
export declare function signRefreshToken(payload: object): string;
export declare function verifyAccessToken(token: string): string | jwt.JwtPayload;
//# sourceMappingURL=jwt.d.ts.map