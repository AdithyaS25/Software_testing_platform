"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTesterPerformanceController = void 0;
const tester_performance_service_1 = require("./tester-performance.service");
const getTesterPerformanceController = async (req, res) => {
    const report = await (0, tester_performance_service_1.generateTesterPerformanceReport)();
    return res.status(200).json({
        success: true,
        data: report,
    });
};
exports.getTesterPerformanceController = getTesterPerformanceController;
//# sourceMappingURL=tester-performance.controller.js.map