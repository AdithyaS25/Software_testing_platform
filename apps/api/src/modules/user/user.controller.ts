// File: apps/api/src/modules/user/user.controller.ts
/// <reference path="../../types/express.d.ts" />
import { Request, Response } from 'express';
import { prisma } from '../../prisma';

export async function getUsersController(req: Request, res: Response) {
  const role = req.query.role as string | undefined;

  const users = await prisma.user.findMany({
    where: role ? { role: role as any } : {},
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: { email: 'asc' },
  });

  return res.status(200).json({ success: true, data: users });
}
