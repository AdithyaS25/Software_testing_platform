// File: apps/api/src/modules/project/project.controller.ts

import { Request, Response, NextFunction } from 'express';
import * as projectService from './project.service';

// ─────────────────────────────────────────────────────────────
// Helper: safely extract route params (strict mode safe)
// ─────────────────────────────────────────────────────────────

function getParam(
  value: string | string[] | undefined,
  name: string
): string {
  if (!value || Array.isArray(value)) {
    throw new Error(`Invalid or missing route parameter: ${name}`);
  }
  return value;
}

// ─── Projects ────────────────────────────────────────────────

export async function createProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.createProject(req.user!.id, req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function getAllProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await projectService.getAllProjects(req.user!.id);
    res.json({ success: true, data: projects });
  } catch (err) {
    next(err);
  }
}

export async function getProjectById(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.getProjectById(
      getParam(req.params.projectId, 'projectId'),
      req.user!.id
    );
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function updateProject(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.updateProject(
      getParam(req.params.projectId, 'projectId'),
      req.user!.id,
      req.body
    );
    res.json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function deleteProject(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await projectService.deleteProject(
      getParam(req.params.projectId, 'projectId'),
      req.user!.id
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// ─── Members ─────────────────────────────────────────────────

export async function addMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const project = await projectService.addMembers(
      getParam(req.params.projectId, 'projectId'),
      req.user!.id,
      req.body
    );
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await projectService.removeMember(
      getParam(req.params.projectId, 'projectId'),
      getParam(req.params.userId, 'userId'),
      req.user!.id
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

// ─── Environments ─────────────────────────────────────────────

export async function upsertEnvironment(req: Request, res: Response, next: NextFunction) {
  try {
    const env = await projectService.upsertEnvironment(
      getParam(req.params.projectId, 'projectId'),
      req.user!.id,
      req.params.envId ? getParam(req.params.envId, 'envId') : undefined,
      req.body
    );
    res.status(201).json({ success: true, data: env });
  } catch (err) {
    next(err);
  }
}

export async function deleteEnvironment(req: Request, res: Response, next: NextFunction) {
  try {
    await projectService.deleteEnvironment(
      getParam(req.params.projectId, 'projectId'),
      getParam(req.params.envId, 'envId'),
      req.user!.id
    );
    res.json({ success: true, message: 'Environment deleted' });
  } catch (err) {
    next(err);
  }
}

// ─── Custom Fields ────────────────────────────────────────────

export async function upsertCustomField(req: Request, res: Response, next: NextFunction) {
  try {
    const field = await projectService.upsertCustomField(
      getParam(req.params.projectId, 'projectId'),
      req.user!.id,
      req.params.fieldId ? getParam(req.params.fieldId, 'fieldId') : undefined,
      req.body
    );
    res.status(201).json({ success: true, data: field });
  } catch (err) {
    next(err);
  }
}

export async function deleteCustomField(req: Request, res: Response, next: NextFunction) {
  try {
    await projectService.deleteCustomField(
      getParam(req.params.projectId, 'projectId'),
      getParam(req.params.fieldId, 'fieldId'),
      req.user!.id
    );
    res.json({ success: true, message: 'Custom field deleted' });
  } catch (err) {
    next(err);
  }
}

// ─── Milestones ───────────────────────────────────────────────

export async function createMilestone(req: Request, res: Response, next: NextFunction) {
  try {
    const milestone = await projectService.createMilestone(
      getParam(req.params.projectId, 'projectId'),
      req.user!.id,
      req.body
    );
    res.status(201).json({ success: true, data: milestone });
  } catch (err) {
    next(err);
  }
}

export async function getMilestones(req: Request, res: Response, next: NextFunction) {
  try {
    const milestones = await projectService.getMilestones(
      getParam(req.params.projectId, 'projectId'),
      req.user!.id
    );
    res.json({ success: true, data: milestones });
  } catch (err) {
    next(err);
  }
}

export async function getMilestoneById(req: Request, res: Response, next: NextFunction) {
  try {
    const milestone = await projectService.getMilestoneById(
      getParam(req.params.projectId, 'projectId'),
      getParam(req.params.milestoneId, 'milestoneId'),
      req.user!.id
    );
    res.json({ success: true, data: milestone });
  } catch (err) {
    next(err);
  }
}

export async function updateMilestone(req: Request, res: Response, next: NextFunction) {
  try {
    const milestone = await projectService.updateMilestone(
      getParam(req.params.projectId, 'projectId'),
      getParam(req.params.milestoneId, 'milestoneId'),
      req.user!.id,
      req.body
    );
    res.json({ success: true, data: milestone });
  } catch (err) {
    next(err);
  }
}

export async function deleteMilestone(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await projectService.deleteMilestone(
      getParam(req.params.projectId, 'projectId'),
      getParam(req.params.milestoneId, 'milestoneId'),
      req.user!.id
    );
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
}

export async function linkTestRuns(req: Request, res: Response, next: NextFunction) {
  try {
    const milestone = await projectService.linkTestRunsToMilestone(
      getParam(req.params.projectId, 'projectId'),
      getParam(req.params.milestoneId, 'milestoneId'),
      req.user!.id,
      req.body
    );
    res.json({ success: true, data: milestone });
  } catch (err) {
    next(err);
  }
}

export async function unlinkTestRun(req: Request, res: Response, next: NextFunction) {
  try {
    const milestone = await projectService.unlinkTestRunFromMilestone(
      getParam(req.params.projectId, 'projectId'),
      getParam(req.params.milestoneId, 'milestoneId'),
      getParam(req.params.testRunId, 'testRunId'),
      req.user!.id
    );
    res.json({ success: true, data: milestone });
  } catch (err) {
    next(err);
  }
}
