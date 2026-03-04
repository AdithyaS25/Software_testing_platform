"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportBugReportController = exports.exportTestExecutionController = void 0;
const export_service_1 = require("./export.service");
/* ============================
   EXPORT TEST EXECUTION CSV
============================ */
const exportTestExecutionController = async (req, res) => {
    const projectIdParam = req.params.projectId;
    const testRunIdParam = req.params.testRunId;
    const projectId = Array.isArray(projectIdParam)
        ? projectIdParam[0]
        : projectIdParam;
    const testRunId = Array.isArray(testRunIdParam)
        ? testRunIdParam[0]
        : testRunIdParam;
    if (!projectId || !testRunId) {
        return res.status(400).json({
            message: "Invalid Project ID or Test Run ID",
        });
    }
    const csv = await (0, export_service_1.exportTestExecutionCSV)(projectId, testRunId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="test-execution-${testRunId}.csv"`);
    return res.status(200).send(csv);
};
exports.exportTestExecutionController = exportTestExecutionController;
/* ============================
   EXPORT BUG REPORT CSV
============================ */
const exportBugReportController = async (req, res) => {
    const projectIdParam = req.params.projectId;
    const projectId = Array.isArray(projectIdParam)
        ? projectIdParam[0]
        : projectIdParam;
    if (!projectId) {
        return res.status(400).json({
            message: "Invalid Project ID",
        });
    }
    const csv = await (0, export_service_1.exportBugReportCSV)(projectId);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="bug-report-${projectId}.csv"`);
    return res.status(200).send(csv);
};
exports.exportBugReportController = exportBugReportController;
//# sourceMappingURL=export.controller.js.map