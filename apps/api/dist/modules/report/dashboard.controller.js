"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardController = void 0;
const dashboard_service_1 = require("./dashboard.service");
const getDashboardController = async (req, res) => {
    const projectId = req.params.projectId;
    if (!projectId || Array.isArray(projectId)) {
        return res.status(400).json({ message: "Invalid projectId" });
    }
    const report = await (0, dashboard_service_1.generateDashboardReport)(projectId);
    return res.status(200).json({
        success: true,
        data: report,
    });
};
exports.getDashboardController = getDashboardController;
//# sourceMappingURL=dashboard.controller.js.map