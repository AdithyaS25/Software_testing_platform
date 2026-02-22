import { Request, Response } from "express";
import { prisma } from "../../prisma";
import { BugStatus } from "@prisma/client";

export const createBugController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      severity,
      priority,
      environment,
      affectedVersion,
      assignedToId,
      testCaseId,
    } = req.body;

    if (!title || !description || !expectedBehavior || !actualBehavior || !severity || !priority) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    const bugCount = await prisma.bug.count();
    const bugId = `BUG-${new Date().getFullYear()}-${String(
      bugCount + 1
    ).padStart(5, "0")}`;

    const bug = await prisma.bug.create({
      data: {
        bugId,
        title,
        description,
        stepsToReproduce,
        expectedBehavior,
        actualBehavior,
        severity,
        priority,
        status: BugStatus.NEW,
        environment,
        affectedVersion,
        assignedToId,
        testCaseId,
      },
    });

    return res.status(201).json(bug);
  } catch (error: unknown) {
    if (error instanceof Error) {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};