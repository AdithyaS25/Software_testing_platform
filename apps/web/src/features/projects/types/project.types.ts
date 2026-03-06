// ─── Status Types ────────────────────────────────────────────

export type ProjectStatus = 'ACTIVE' | 'ARCHIVED' | 'COMPLETED';

export type MilestoneStatus =
  | 'UPCOMING'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'MISSED';

export type CustomFieldType =
  | 'TEXT'
  | 'NUMBER'
  | 'DROPDOWN'
  | 'DATE'
  | 'BOOLEAN';

// ─── Project ────────────────────────────────────────────────

export interface Project {
  id: string;
  name: string;
  description?: string;
  key: string;
  status: ProjectStatus;
  ownerId: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  members?: ProjectMember[];
  environments?: ProjectEnvironment[];
  customFields?: ProjectCustomField[];
  milestones?: Milestone[];
  _count?: {
    testCases: number;
    bugs: number;
    testRuns: number;
    members: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  joinedAt: string;
}

export interface ProjectEnvironment {
  id: string;
  projectId: string;
  name: string;
  url?: string;
}

export interface ProjectCustomField {
  id: string;
  projectId: string;
  name: string;
  fieldType: CustomFieldType;
  options: string[];
  required: boolean;
}

// ─── Milestone ───────────────────────────────────────────────

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  targetDate: string;
  passRateTarget?: number;
  status: MilestoneStatus;
  testRuns?: MilestoneTestRunEntry[];
  progress?: MilestoneProgress;
  createdAt: string;
  updatedAt: string;
}

export interface MilestoneTestRunEntry {
  milestoneId: string;
  testRunId: string;
  testRun: {
    id: string;
    name: string;
    status: string;
    passRate?: number;
  };
  linkedAt: string;
}

export interface MilestoneProgress {
  totalTestRuns: number;
  completedTestRuns: number;
  averagePassRate: number;
  targetMet: boolean;
}

// ─── DTOs ────────────────────────────────────────────────────

export interface CreateProjectDto {
  name: string;
  description?: string;
  key: string;
  memberIds?: string[];
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  status?: ProjectStatus;
}

export interface AddMembersDto {
  userIds: string[];
}

export interface UpsertEnvironmentDto {
  name: string;
  url?: string;
}

export interface UpsertCustomFieldDto {
  name: string;
  fieldType: CustomFieldType;
  options?: string[];
  required?: boolean;
}

export interface CreateMilestoneDto {
  name: string;
  description?: string;
  targetDate: string;
  passRateTarget?: number;
  testRunIds?: string[];
}

export interface UpdateMilestoneDto {
  name?: string;
  description?: string;
  targetDate?: string;
  passRateTarget?: number;
  status?: MilestoneStatus;
}

export interface LinkTestRunsDto {
  testRunIds: string[];
}
