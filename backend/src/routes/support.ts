import { Router } from "express";
import { z } from "zod";
import { Role, TicketStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

export const supportRouter = Router();
supportRouter.use(requireAuth);

const createSchema = z.object({
  subject: z.string().min(1),
  message: z.string().min(1),
});

supportRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const ticket = await prisma.supportTicket.create({
      data: { ...data, userId: req.user!.userId },
    });
    res.status(201).json(ticket);
  })
);

supportRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const where = req.user!.role === Role.ADMIN ? {} : { userId: req.user!.userId };
    const tickets = await prisma.supportTicket.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(tickets);
  })
);

const updateSchema = z.object({ status: z.nativeEnum(TicketStatus) });

supportRouter.patch(
  "/:id",
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const { status } = updateSchema.parse(req.body);
    const ticket = await prisma.supportTicket.update({
      where: { id: req.params.id as string },
      data: { status },
    });
    res.json(ticket);
  })
);
