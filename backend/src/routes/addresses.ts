import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

export const addressesRouter = Router();
addressesRouter.use(requireAuth);

addressesRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const addresses = await prisma.address.findMany({ where: { userId: req.user!.userId } });
    res.json(addresses);
  })
);

const createSchema = z.object({
  label: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
});

addressesRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const data = createSchema.parse(req.body);
    const address = await prisma.address.create({ data: { ...data, userId: req.user!.userId } });
    res.status(201).json(address);
  })
);

addressesRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const address = await prisma.address.findUnique({ where: { id: req.params.id as string } });
    if (!address || address.userId !== req.user!.userId) {
      return res.status(404).json({ error: "Adresse introuvable" });
    }
    await prisma.address.delete({ where: { id: address.id } });
    res.status(204).send();
  })
);
