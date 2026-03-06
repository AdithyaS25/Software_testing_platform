import { prisma } from '../../prisma';
import { DeveloperPerformanceReport } from './developer-performance.types';

export const generateDeveloperPerformanceReport =
  async (): Promise<DeveloperPerformanceReport> => {
    // Get all developers who have assigned bugs
    const grouped = await prisma.bug.groupBy({
      by: ['assignedToId'],
      _count: { id: true },
    });

    const developers = await Promise.all(
      grouped
        .filter((g) => g.assignedToId)
        .map(async (g) => {
          const developerId = g.assignedToId!;

          const user = await prisma.user.findUnique({
            where: { id: developerId },
          });

          const assignedBugs = await prisma.bug.findMany({
            where: { assignedToId: developerId },
          });

          const totalAssigned = assignedBugs.length;

          const resolvedBugs = assignedBugs.filter(
            (bug) => bug.resolvedAt !== null
          );

          const totalResolved = resolvedBugs.length;

          const openBugs = assignedBugs.filter(
            (bug) => bug.resolvedAt === null
          ).length;

          const resolutionDays = resolvedBugs.map((bug) => {
            const diff = bug.resolvedAt!.getTime() - bug.createdAt.getTime();
            return diff / (1000 * 60 * 60 * 24);
          });

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

          const resolutionRate =
            totalAssigned > 0
              ? Number(((totalResolved / totalAssigned) * 100).toFixed(1))
              : 0;

          return {
            developerId,
            developerEmail: user?.email ?? 'Unknown',
            totalAssigned,
            totalResolved,
            openBugs,
            averageResolutionDays,
            fastestResolutionDays,
            slowestResolutionDays,
            resolutionRate,
          };
        })
    );

    return { developers };
  };
