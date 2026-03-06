// File: apps/api/src/modules/test-suite/testSuite.service.ts

import { prisma } from '../../prisma';
import {
  SuiteExecutionStatus,
  SuiteExecutionMode,
  ExecutionStatus,
} from '@prisma/client';

export const executeSuite = async (
  projectId: string,
  suiteId: string,
  userId: string,
  executionMode: SuiteExecutionMode
) => {
  return prisma.$transaction(async (tx) => {
    const suite = await tx.testSuite.findFirst({
      where: { id: suiteId, projectId },
      include: {
        // ✅ Fixed: include the actual testCase records via the junction table
        testCases: {
          include: { testCase: true },
        },
      },
    });

    if (!suite) throw new Error('Suite not found in project');
    if (suite.testCases.length === 0)
      throw new Error('Suite has no test cases');

    const suiteExecution = await tx.testSuiteExecution.create({
      data: {
        suiteId,
        executedById: userId,
        executionMode,
        status: SuiteExecutionStatus.IN_PROGRESS,
        totalTests: suite.testCases.length,
      },
    });

    // ✅ Fixed: use tc.testCaseId (the FK on the junction row), not tc.id (the junction row's own PK)
    await tx.execution.createMany({
      data: suite.testCases.map((tc) => ({
        testCaseId: tc.testCaseId, // ← was tc.id which is the junction table row ID
        executedById: userId,
        suiteExecutionId: suiteExecution.id,
        status: ExecutionStatus.IN_PROGRESS,
      })),
    });

    return suiteExecution;
  });
};

export const completeSuiteExecution = async (suiteExecutionId: string) => {
  return prisma.$transaction(async (tx) => {
    const suiteExecution = await tx.testSuiteExecution.findUnique({
      where: { id: suiteExecutionId },
    });

    if (!suiteExecution) {
      throw new Error('Suite execution not found');
    }

    const executions = await tx.execution.findMany({
      where: { suiteExecutionId },
    });

    const total = executions.length;
    const passed = executions.filter((e) => e.status === 'PASSED').length;
    const failed = executions.filter((e) => e.status === 'FAILED').length;
    const blocked = executions.filter((e) => e.status === 'BLOCKED').length;
    const skipped = executions.filter((e) => e.status === 'SKIPPED').length;

    const updatedSuiteExecution = await tx.testSuiteExecution.update({
      where: { id: suiteExecutionId },
      data: {
        passed,
        failed,
        blocked,
        skipped,
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });

    return {
      ...updatedSuiteExecution,
      passRate: total === 0 ? 0 : Math.round((passed / total) * 100),
    };
  });
};

export const getSuiteExecutionReport = async (suiteExecutionId: string) => {
  const suiteExecution = await prisma.testSuiteExecution.findUnique({
    where: { id: suiteExecutionId },
    include: {
      suite: true,
      executions: {
        include: { testCase: true },
      },
    },
  });

  if (!suiteExecution) {
    throw new Error('Suite execution not found');
  }

  return {
    suite: {
      id: suiteExecution.suite.id,
      name: suiteExecution.suite.name,
      module: suiteExecution.suite.module,
    },
    summary: {
      totalTests: suiteExecution.totalTests,
      passed: suiteExecution.passed,
      failed: suiteExecution.failed,
      blocked: suiteExecution.blocked,
      skipped: suiteExecution.skipped,
      status: suiteExecution.status,
      startedAt: suiteExecution.startedAt,
      completedAt: suiteExecution.completedAt,
    },
    executions: suiteExecution.executions.map((execution) => ({
      executionId: execution.id,
      status: execution.status,
      testCase: {
        id: execution.testCase.id,
        title: execution.testCase.title,
        module: execution.testCase.module,
      },
    })),
  };
};
