"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBugReportController = void 0;
const bug_report_service_1 = require("./bug-report.service");
const getBugReportController = async (req, res) => {
    const projectId = req.params.projectId;
    const report = await (0, bug_report_service_1.generateBugReport)(projectId);
    return res.status(200).json({
        success: true,
        data: report,
    });
};
exports.getBugReportController = getBugReportController;
//# sourceMappingURL=bug-report.controller.js.map