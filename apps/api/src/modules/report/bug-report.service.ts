// File: apps/api/src/modules/report/bug.report.service.ts

import { prisma } from '../../prisma';

export async function generateBugReport(projectId: string) {
  // ── Total ──────────────────────────────────────────────
  const total = await prisma.bug.count({ where: { projectId } });

  // ── By Status ──────────────────────────────────────────
  const byStatusRaw = await prisma.bug.groupBy({
    by: ['status'],
    where: { projectId },
    _count: { status: true },
  });
  const byStatus = byStatusRaw.map((r) => ({
    status: r.status,
    count: r._count.status,
  }));

  // ── By Severity ────────────────────────────────────────
  const bySeverityRaw = await prisma.bug.groupBy({
    by: ['severity'],
    where: { projectId },
    _count: { severity: true },
  });
  const bySeverity = bySeverityRaw.map((r) => ({
    severity: r.severity,
    count: r._count.severity,
  }));

  // ── By Priority ────────────────────────────────────────
  const byPriorityRaw = await prisma.bug.groupBy({
    by: ['priority'],
    where: { projectId },
    _count: { priority: true },
  });
  const byPriority = byPriorityRaw.map((r) => ({
    priority: r.priority,
    count: r._count.priority,
  }));

  // ── Aging (open bugs) ──────────────────────────────────
  const openBugs = await prisma.bug.findMany({
    where: { projectId, resolvedAt: null },
    select: { createdAt: true },
  });

  const now = Date.now();
  const ageDays = openBugs.map((b) => (now - b.createdAt.getTime()) / 86400000);
  const averageDaysOpen = ageDays.length
    ? ageDays.reduce((a, b) => a + b, 0) / ageDays.length
    : 0;
  const oldestOpenBugDays = ageDays.length ? Math.max(...ageDays) : 0;

  // ── Resolution metrics (resolved bugs) ────────────────
  const resolvedBugs = await prisma.bug.findMany({
    where: { projectId, resolvedAt: { not: null } },
    select: { createdAt: true, resolvedAt: true },
  });

  const resolutionDays = resolvedBugs.map(
    (b) => (b.resolvedAt!.getTime() - b.createdAt.getTime()) / 86400000
  );
  const averageResolutionDays = resolutionDays.length
    ? resolutionDays.reduce((a, b) => a + b, 0) / resolutionDays.length
    : 0;
  const fastestResolutionDays = resolutionDays.length
    ? Math.min(...resolutionDays)
    : 0;

  // ── By Developer ───────────────────────────────────────
  const byDevRaw = await prisma.bug.groupBy({
    by: ['assignedToId'],
    where: { projectId, assignedToId: { not: null } },
    _count: { id: true },
  });

  const byDeveloper = await Promise.all(
    byDevRaw.map(async (row) => {
      const dev = await prisma.user.findUnique({
        where: { id: row.assignedToId! },
        select: { id: true, email: true },
      });

      const fixedCount = await prisma.bug.count({
        where: { projectId, assignedToId: row.assignedToId, status: 'FIXED' },
      });

      const devResolved = await prisma.bug.findMany({
        where: {
          projectId,
          assignedToId: row.assignedToId,
          resolvedAt: { not: null },
        },
        select: { createdAt: true, resolvedAt: true },
      });
      const devDays = devResolved.map(
        (b) => (b.resolvedAt!.getTime() - b.createdAt.getTime()) / 86400000
      );
      const avgResolutionDays = devDays.length
        ? devDays.reduce((a, b) => a + b, 0) / devDays.length
        : 0;

      return {
        developerId: row.assignedToId,
        developerName: dev?.email?.split('@')[0] ?? 'Unknown',
        totalAssigned: row._count.id,
        totalFixed: fixedCount,
        avgResolutionDays: Number(avgResolutionDays.toFixed(1)),
      };
    })
  );

  return {
    summary: {
      total,
      byStatus,
      bySeverity,
      byPriority,
    },
    aging: {
      averageDaysOpen: Number(averageDaysOpen.toFixed(1)),
      oldestOpenBugDays: Number(oldestOpenBugDays.toFixed(1)),
    },
    resolutionMetrics: {
      averageResolutionDays: Number(averageResolutionDays.toFixed(1)),
      fastestResolutionDays: Number(fastestResolutionDays.toFixed(1)),
    },
    byDeveloper,
  };
}
