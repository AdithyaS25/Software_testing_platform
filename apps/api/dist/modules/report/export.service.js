"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportTestExecutionCSV = exportTestExecutionCSV;
exports.exportBugReportCSV = exportBugReportCSV;
const prisma_1 = require("../../prisma");
const report_service_1 = require("./report.service");
/* ============================
   EXPORT TEST EXECUTION CSV
============================ */
async function exportTestExecutionCSV(projectId, testRunId) {
    const report = await (0, report_service_1.generateTestExecutionReport)(projectId, testRunId);
    const rows = [
        [
            "Module",
            "Total Executed",
            "Failed",
            "Passed",
        ],
    ];
    report.executionByModule.forEach((item) => {
        const passed = item.total - item.failed;
        rows.push([
            item.module,
            item.total.toString(),
            item.failed.toString(),
            passed.toString(),
        ]);
    });
    return rows.map((row) => row.join(",")).join("\n");
}
/* ============================
   EXPORT BUG REPORT CSV
============================ */
async function exportBugReportCSV(projectId) {
    const bugs = await prisma_1.prisma.bug.findMany({
        where: { projectId },
        orderBy: { createdAt: "desc" },
    });
    const rows = [
        [
            "Bug ID",
            "Title",
            "Status",
            "Priority",
            "Severity",
            "Created At",
        ],
    ];
    bugs.forEach((bug) => {
        rows.push([
            bug.bugId,
            bug.title,
            bug.status,
            bug.priority,
            bug.severity,
            bug.createdAt.toISOString(),
        ]);
    });
    return rows.map((row) => row.join(",")).join("\n");
}
//# sourceMappingURL=export.service.js.map