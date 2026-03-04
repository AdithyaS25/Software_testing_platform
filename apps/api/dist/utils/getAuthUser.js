"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthUser = getAuthUser;
function getAuthUser(req) {
    if (!req.user) {
        throw new Error("Unauthorized: User missing from request");
    }
    return req.user;
}
//# sourceMappingURL=getAuthUser.js.map