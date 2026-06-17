import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

export const meRouter = Router();

meRouter.get(
  "/",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: { pharmacy: true, courier: true, addresses: true },
    });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    const { passwordHash, ...safe } = user;
    res.json(safe);
  })
);
