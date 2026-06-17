import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { signToken } from "../utils/jwt";
import { asyncHandler } from "../middleware/errorHandler";

export const authRouter = Router();

const SELF_REGISTERABLE_ROLES = [Role.CLIENT, Role.PHARMACY, Role.COURIER] as const;

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  phone: z.string().optional(),
  role: z.enum(SELF_REGISTERABLE_ROLES).default(Role.CLIENT),
  // Pharmacy-specific
  pharmacyName: z.string().optional(),
  pharmacyAddress: z.string().optional(),
  pharmacyCity: z.string().optional(),
  pharmacyPhone: z.string().optional(),
  // Courier-specific
  zone: z.string().optional(),
});

authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const data = registerSchema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      return res.status(409).json({ error: "Cet email est déjà utilisé" });
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        role: data.role,
        ...(data.role === Role.PHARMACY && {
          pharmacy: {
            create: {
              name: data.pharmacyName || data.name,
              address: data.pharmacyAddress || "",
              city: data.pharmacyCity || "",
              phone: data.pharmacyPhone || data.phone || "",
            },
          },
        }),
        ...(data.role === Role.COURIER && {
          courier: {
            create: {
              zone: data.zone,
            },
          },
        }),
      },
      include: { pharmacy: true, courier: true },
    });

    const token = signToken({ userId: user.id, role: user.role });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  })
);

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect" });
    }
    if (!user.isActive) {
      return res.status(403).json({ error: "Compte suspendu" });
    }
    const token = signToken({ userId: user.id, role: user.role });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  })
);
