"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDeveloperPerformanceController = void 0;
const developer_performance_service_1 = require("./developer-performance.service");
const getDeveloperPerformanceController = async (req, res) => {
    const report = await (0, developer_performance_service_1.generateDeveloperPerformanceReport)();
    return res.status(200).json({
        success: true,
        data: report,
    });
};
exports.getDeveloperPerformanceController = getDeveloperPerformanceController;
//# sourceMappingURL=developer-performance.controller.js.map