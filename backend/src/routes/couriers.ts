import { Router } from "express";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

export const couriersRouter = Router();
couriersRouter.use(requireAuth);

couriersRouter.get(
  "/",
  requireRole(Role.ADMIN),
  asyncHandler(async (_req, res) => {
    const couriers = await prisma.courier.findMany({ include: { user: true } });
    res.json(couriers);
  })
);

couriersRouter.get(
  "/me",
  requireRole(Role.COURIER),
  asyncHandler(async (req, res) => {
    const courier = await prisma.courier.findUnique({ where: { userId: req.user!.userId } });
    if (!courier) return res.status(404).json({ error: "Profil livreur introuvable" });
    res.json(courier);
  })
);
