import { Router } from "express";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

export const productsRouter = Router();

async function getOwnPharmacyId(userId: string) {
  const pharmacy = await prisma.pharmacy.findUnique({ where: { userId } });
  return pharmacy?.id;
}

// Pharmacy: list own catalog (includes inactive)
productsRouter.get(
  "/mine",
  requireAuth,
  requireRole(Role.PHARMACY),
  asyncHandler(async (req, res) => {
    const pharmacyId = await getOwnPharmacyId(req.user!.userId);
    if (!pharmacyId) return res.status(404).json({ error: "Pharmacie introuvable" });
    const products = await prisma.product.findMany({
      where: { pharmacyId },
      orderBy: { name: "asc" },
    });
    res.json(products);
  })
);

const productSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().min(0).default(0),
  category: z.string().optional(),
  isPrescriptionRequired: z.boolean().default(false),
});

productsRouter.post(
  "/",
  requireAuth,
  requireRole(Role.PHARMACY),
  asyncHandler(async (req, res) => {
    const pharmacyId = await getOwnPharmacyId(req.user!.userId);
    if (!pharmacyId) return res.status(404).json({ error: "Pharmacie introuvable" });
    const data = productSchema.parse(req.body);
    const product = await prisma.product.create({ data: { ...data, pharmacyId } });
    res.status(201).json(product);
  })
);

productsRouter.patch(
  "/:id",
  requireAuth,
  requireRole(Role.PHARMACY),
  asyncHandler(async (req, res) => {
    const pharmacyId = await getOwnPharmacyId(req.user!.userId);
    const product = await prisma.product.findUnique({ where: { id: req.params.id as string } });
    if (!product || product.pharmacyId !== pharmacyId) {
      return res.status(404).json({ error: "Produit introuvable" });
    }
    const data = productSchema.partial().parse(req.body);
    const updated = await prisma.product.update({ where: { id: product.id }, data });
    res.json(updated);
  })
);

productsRouter.delete(
  "/:id",
  requireAuth,
  requireRole(Role.PHARMACY),
  asyncHandler(async (req, res) => {
    const pharmacyId = await getOwnPharmacyId(req.user!.userId);
    const product = await prisma.product.findUnique({ where: { id: req.params.id as string } });
    if (!product || product.pharmacyId !== pharmacyId) {
      return res.status(404).json({ error: "Produit introuvable" });
    }
    await prisma.product.update({ where: { id: product.id }, data: { isActive: false } });
    res.status(204).send();
  })
);
