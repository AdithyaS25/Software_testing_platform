"use strict";
// File: apps/api/src/modules/report/report.controller.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTestExecutionReport = getTestExecutionReport;
exports.getBugReport = getBugReport;
const report_service_1 = require("./report.service");
const bug_report_service_1 = require("./bug-report.service"); // ← new
// ── Test Execution Report ──────────────────────────────────────────────────
async function getTestExecutionReport(req, res) {
    const { projectId, testRunId } = req.params;
    if (!projectId || typeof projectId !== "string") {
        return res.status(400).json({ success: false, message: "Invalid projectId" });
    }
    if (!testRunId || typeof testRunId !== "string") {
        return res.status(400).json({ success: false, message: "Invalid testRunId" });
    }
    const report = await (0, report_service_1.generateTestExecutionReport)(projectId, testRunId);
    return res.status(200).json({ success: true, data: report });
}
// ── Bug Report (JSON stats) ────────────────────────────────────────────────
async function getBugReport(req, res) {
    const { projectId } = req.params;
    if (!projectId || typeof projectId !== "string") {
        return res.status(400).json({ success: false, message: "Invalid projectId" });
    }
    const report = await (0, bug_report_service_1.generateBugReport)(projectId);
    return res.status(200).json({ success: true, data: report });
}
//# sourceMappingURL=report.controller.js.map