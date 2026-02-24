import { prisma } from "../../prisma";
import { BugReport } from "./bug-report.types";

export const generateBugReport = async (): Promise<BugReport> => {
  // =============================
  // SUMMARY
  // =============================

  const total = await prisma.bug.count();

  const byStatusRaw = await prisma.bug.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const bySeverityRaw = await prisma.bug.groupBy({
    by: ["severity"],
    _count: { severity: true },
  });

  const byPriorityRaw = await prisma.bug.groupBy({
    by: ["priority"],
    _count: { priority: true },
  });

  // =============================
  // AGING (Open Bugs Only)
  // =============================

  const openBugs = await prisma.bug.findMany({
    where: {
      resolvedAt: null,
    },
    select: { createdAt: true },
  });

  const now = new Date();

  const agingDays = openBugs.map((bug) => {
    const diff =
      now.getTime() - bug.createdAt.getTime();
    return diff / (1000 * 60 * 60 * 24);
  });

  const averageDaysOpen =
    agingDays.length > 0
      ? Number(
          (
            agingDays.reduce((a, b) => a + b, 0) /
            agingDays.length
          ).toFixed(1)
        )
      : 0;

  const oldestOpenBugDays =
    agingDays.length > 0
      ? Number(Math.max(...agingDays).toFixed(1))
      : 0;

  // =============================
  // BUGS BY DEVELOPER
  // =============================

  const byDeveloperRaw = await prisma.bug.groupBy({
    by: ["assignedToId"],
    _count: { id: true },
  });

  const byDeveloper = await Promise.all(
    byDeveloperRaw
      .filter((item) => item.assignedToId)
      .map(async (item) => {
        const user = await prisma.user.findUnique({
          where: { id: item.assignedToId! },
        });

        return {
          developerId: item.assignedToId!,
          developerEmail: user?.email ?? "Unknown",
          totalAssigned: item._count.id,
        };
      })
  );

  // =============================
// TRENDS (Created Per Day)
// =============================

const bugs = await prisma.bug.findMany({
  select: { createdAt: true },
});

const trendMap: Record<string, number> = {};

bugs.forEach((bug) => {
  const iso = bug.createdAt.toISOString();
  const date = iso.split("T")[0];

  if (!date) return; // strict safety

  trendMap[date] = (trendMap[date] ?? 0) + 1;
});

const trends = Object.entries(trendMap).map(
  ([date, totalCreated]) => ({
    date,
    totalCreated,
  })
);

  // =============================
  // RESOLUTION METRICS
  // =============================

  const resolvedBugs = await prisma.bug.findMany({
    where: {
      resolvedAt: { not: null },
    },
    select: {
      createdAt: true,
      resolvedAt: true,
    },
  });

  const resolutionDays = resolvedBugs.map(
    (bug) => {
      const diff =
        bug.resolvedAt!.getTime() -
        bug.createdAt.getTime();
      return diff / (1000 * 60 * 60 * 24);
    }
  );

  const averageResolutionDays =
    resolutionDays.length > 0
      ? Number(
          (
            resolutionDays.reduce((a, b) => a + b, 0) /
            resolutionDays.length
          ).toFixed(1)
        )
      : 0;

  const fastestResolutionDays =
    resolutionDays.length > 0
      ? Number(Math.min(...resolutionDays).toFixed(1))
      : 0;

  const slowestResolutionDays =
    resolutionDays.length > 0
      ? Number(Math.max(...resolutionDays).toFixed(1))
      : 0;

  return {
    summary: {
      total,
      byStatus: byStatusRaw.map((item) => ({
        status: item.status,
        count: item._count.status,
      })),
      bySeverity: bySeverityRaw.map((item) => ({
        severity: item.severity,
        count: item._count.severity,
      })),
      byPriority: byPriorityRaw.map((item) => ({
        priority: item.priority,
        count: item._count.priority,
      })),
    },
    aging: {
      averageDaysOpen,
      oldestOpenBugDays,
    },
    byDeveloper,
    trends,
    resolutionMetrics: {
      averageResolutionDays,
      fastestResolutionDays,
      slowestResolutionDays,
    },
  };
};
