import { Router } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

export const pharmaciesRouter = Router();

// Public: search/list active pharmacies
pharmaciesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { city, q } = req.query as { city?: string; q?: string };
    const pharmacies = await prisma.pharmacy.findMany({
      where: {
        isActive: true,
        ...(city && { city: { equals: city, mode: "insensitive" } }),
        ...(q && { name: { contains: q, mode: "insensitive" } }),
      },
      orderBy: { name: "asc" },
    });
    res.json(pharmacies);
  })
);

pharmaciesRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const pharmacy = await prisma.pharmacy.findUnique({
      where: { id: req.params.id as string },
      include: { products: { where: { isActive: true } } },
    });
    if (!pharmacy) return res.status(404).json({ error: "Pharmacie introuvable" });
    res.json(pharmacy);
  })
);

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  openingHours: z.string().optional(),
});

// Pharmacy owner: get/update own profile
pharmaciesRouter.get(
  "/me/profile",
  requireAuth,
  requireRole(Role.PHARMACY),
  asyncHandler(async (req, res) => {
    const pharmacy = await prisma.pharmacy.findUnique({ where: { userId: req.user!.userId } });
    if (!pharmacy) return res.status(404).json({ error: "Pharmacie introuvable" });
    res.json(pharmacy);
  })
);

pharmaciesRouter.patch(
  "/me/profile",
  requireAuth,
  requireRole(Role.PHARMACY),
  asyncHandler(async (req, res) => {
    const data = updateSchema.parse(req.body);
    const pharmacy = await prisma.pharmacy.update({
      where: { userId: req.user!.userId },
      data,
    });
    res.json(pharmacy);
  })
);
