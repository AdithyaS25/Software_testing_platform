// File: apps/web/src/features/projects/api/projectApi.ts

import { apiClient } from '../../../lib/axios';
// your configured axios instance
import type {
  Project,
  Milestone,
  CreateProjectDto,
  UpdateProjectDto,
  AddMembersDto,
  UpsertEnvironmentDto,
  UpsertCustomFieldDto,
  CreateMilestoneDto,
  UpdateMilestoneDto,
  LinkTestRunsDto,
} from '../types/project.types';

const BASE = '/api/projects';

// ─── Projects ────────────────────────────────────────────────

export const projectApi = {
  getAll: async (): Promise<Project[]> => {
    const { data } = await apiClient.get(BASE);
    return data.data;
  },

  getById: async (projectId: string): Promise<Project> => {
    const { data } = await apiClient.get(`${BASE}/${projectId}`);
    return data.data;
  },

  create: async (payload: CreateProjectDto): Promise<Project> => {
    const { data } = await apiClient.post(BASE, payload);
    return data.data;
  },

  update: async (
    projectId: string,
    payload: UpdateProjectDto
  ): Promise<Project> => {
    const { data } = await apiClient.patch(`${BASE}/${projectId}`, payload);
    return data.data;
  },

  delete: async (projectId: string): Promise<void> => {
    await apiClient.delete(`/api/projects/${projectId}`);
  },

  // ─── Members
  addMembers: async (
    projectId: string,
    payload: AddMembersDto
  ): Promise<Project> => {
    const { data } = await apiClient.post(
      `${BASE}/${projectId}/members`,
      payload
    );
    return data.data;
  },

  removeMember: async (projectId: string, userId: string): Promise<void> => {
    await apiClient.delete(`${BASE}/${projectId}/members/${userId}`);
  },

  // ─── Environments
  createEnvironment: async (
    projectId: string,
    payload: UpsertEnvironmentDto
  ) => {
    const { data } = await apiClient.post(
      `${BASE}/${projectId}/environments`,
      payload
    );
    return data.data;
  },

  updateEnvironment: async (
    projectId: string,
    envId: string,
    payload: UpsertEnvironmentDto
  ) => {
    const { data } = await apiClient.put(
      `${BASE}/${projectId}/environments/${envId}`,
      payload
    );
    return data.data;
  },

  deleteEnvironment: async (
    projectId: string,
    envId: string
  ): Promise<void> => {
    await apiClient.delete(`${BASE}/${projectId}/environments/${envId}`);
  },

  // ─── Custom Fields
  createCustomField: async (
    projectId: string,
    payload: UpsertCustomFieldDto
  ) => {
    const { data } = await apiClient.post(
      `${BASE}/${projectId}/custom-fields`,
      payload
    );
    return data.data;
  },

  updateCustomField: async (
    projectId: string,
    fieldId: string,
    payload: UpsertCustomFieldDto
  ) => {
    const { data } = await apiClient.put(
      `${BASE}/${projectId}/custom-fields/${fieldId}`,
      payload
    );
    return data.data;
  },

  deleteCustomField: async (
    projectId: string,
    fieldId: string
  ): Promise<void> => {
    await apiClient.delete(`${BASE}/${projectId}/custom-fields/${fieldId}`);
  },

  // ─── Milestones
  getMilestones: async (projectId: string): Promise<Milestone[]> => {
    const { data } = await apiClient.get(`${BASE}/${projectId}/milestones`);
    return data.data;
  },

  getMilestoneById: async (
    projectId: string,
    milestoneId: string
  ): Promise<Milestone> => {
    const { data } = await apiClient.get(
      `${BASE}/${projectId}/milestones/${milestoneId}`
    );
    return data.data;
  },

  createMilestone: async (
    projectId: string,
    payload: CreateMilestoneDto
  ): Promise<Milestone> => {
    const { data } = await apiClient.post(
      `${BASE}/${projectId}/milestones`,
      payload
    );
    return data.data;
  },

  updateMilestone: async (
    projectId: string,
    milestoneId: string,
    payload: UpdateMilestoneDto
  ): Promise<Milestone> => {
    const { data } = await apiClient.patch(
      `${BASE}/${projectId}/milestones/${milestoneId}`,
      payload
    );
    return data.data;
  },

  deleteMilestone: async (
    projectId: string,
    milestoneId: string
  ): Promise<void> => {
    await apiClient.delete(`${BASE}/${projectId}/milestones/${milestoneId}`);
  },

  linkTestRuns: async (
    projectId: string,
    milestoneId: string,
    payload: LinkTestRunsDto
  ): Promise<Milestone> => {
    const { data } = await apiClient.post(
      `${BASE}/${projectId}/milestones/${milestoneId}/test-runs`,
      payload
    );
    return data.data;
  },

  unlinkTestRun: async (
    projectId: string,
    milestoneId: string,
    testRunId: string
  ): Promise<void> => {
    await apiClient.delete(
      `${BASE}/${projectId}/milestones/${milestoneId}/test-runs/${testRunId}`
    );
  },
};
