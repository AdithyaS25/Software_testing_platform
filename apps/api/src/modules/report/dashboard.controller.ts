import { Request, Response } from 'express';
import { generateDashboardReport } from './dashboard.service';

export const getDashboardController = async (req: Request, res: Response) => {
  const projectId = req.params.projectId;

  if (!projectId || Array.isArray(projectId)) {
    return res.status(400).json({ message: 'Invalid projectId' });
  }

  const report = await generateDashboardReport(projectId);

  return res.status(200).json({
    success: true,
    data: report,
  });
};
