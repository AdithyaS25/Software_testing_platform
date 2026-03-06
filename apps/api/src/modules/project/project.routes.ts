import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate';
import * as controller from './project.controller';
import {
  createProjectSchema,
  updateProjectSchema,
  addMembersSchema,
  upsertEnvironmentSchema,
  upsertCustomFieldSchema,
  createMilestoneSchema,
  updateMilestoneSchema,
  linkTestRunsSchema,
  projectIdParamSchema,
  milestoneParamSchema,
} from './project.schema';

import testSuiteRoutes from '../test-suite/testSuite.routes';
import testRunRoutes from '../test-run/testRun.routes';
import bugRoutes from '../bug/bug.routes';
import testCaseRoutes from '../test-cases/testCase.routes';
import executionRoutes from '../execution/execution.routes';
import reportRoutes from '../report/report.routes';

const router: Router = Router({ mergeParams: true });

/* =======================
   GLOBAL AUTH FOR PROJECTS
======================= */

router.use(authenticate);

/* =======================
   PROJECT CRUD
======================= */

// GET  /api/projects
router.get('/', controller.getAllProjects);

// POST /api/projects
router.post('/', validate(createProjectSchema), controller.createProject);

// GET /api/projects/:projectId
router.get(
  '/:projectId',
  validate(projectIdParamSchema),
  controller.getProjectById
);

// PATCH /api/projects/:projectId
router.patch(
  '/:projectId',
  validate(updateProjectSchema),
  controller.updateProject
);

// DELETE /api/projects/:projectId
router.delete('/:projectId', controller.deleteProject);

/* =======================
   PROJECT SETTINGS
======================= */

// Members

// GET /api/projects/:projectId/members
router.get(
  '/:projectId/members',
  controller.getMembers // no validate() — accepts any string projectId
);

router.post(
  '/:projectId/members',
  validate(addMembersSchema),
  controller.addMembers
);

router.delete(
  '/:projectId/members/:userId',
  validate(projectIdParamSchema),
  controller.removeMember
);

// Environments
router.post(
  '/:projectId/environments',
  validate(upsertEnvironmentSchema),
  controller.upsertEnvironment
);

router.put(
  '/:projectId/environments/:envId',
  validate(upsertEnvironmentSchema),
  controller.upsertEnvironment
);

router.delete(
  '/:projectId/environments/:envId',
  validate(projectIdParamSchema),
  controller.deleteEnvironment
);

// Custom Fields
router.post(
  '/:projectId/custom-fields',
  validate(upsertCustomFieldSchema),
  controller.upsertCustomField
);

router.put(
  '/:projectId/custom-fields/:fieldId',
  validate(upsertCustomFieldSchema),
  controller.upsertCustomField
);

router.delete(
  '/:projectId/custom-fields/:fieldId',
  validate(projectIdParamSchema),
  controller.deleteCustomField
);

// Milestones
router.get(
  '/:projectId/milestones',
  validate(projectIdParamSchema),
  controller.getMilestones
);

router.post(
  '/:projectId/milestones',
  validate(createMilestoneSchema),
  controller.createMilestone
);

router.get(
  '/:projectId/milestones/:milestoneId',
  validate(milestoneParamSchema),
  controller.getMilestoneById
);

router.patch(
  '/:projectId/milestones/:milestoneId',
  validate(updateMilestoneSchema),
  controller.updateMilestone
);

router.delete(
  '/:projectId/milestones/:milestoneId',
  validate(milestoneParamSchema),
  controller.deleteMilestone
);

router.post(
  '/:projectId/milestones/:milestoneId/test-runs',
  validate(linkTestRunsSchema),
  controller.linkTestRuns
);

router.delete(
  '/:projectId/milestones/:milestoneId/test-runs/:testRunId',
  validate(milestoneParamSchema),
  controller.unlinkTestRun
);

/* =======================
   NESTED RESOURCE ROUTERS
======================= */

router.use('/:projectId/test-cases', testCaseRoutes);
router.use('/:projectId/test-suites', testSuiteRoutes);
router.use('/:projectId/test-runs', testRunRoutes);
router.use('/:projectId/bugs', bugRoutes);
router.use('/:projectId/executions', executionRoutes);
router.use('/:projectId/reports', reportRoutes);

export default router;
