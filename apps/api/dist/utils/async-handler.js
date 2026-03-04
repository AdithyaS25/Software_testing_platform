"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asHandler = asHandler;
function asHandler(fn) {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
}
//# sourceMappingURL=async-handler.js.map