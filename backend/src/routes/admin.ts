import { Router } from "express";
import { z } from "zod";
import { OrderStatus, PaymentStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole(Role.ADMIN));

adminRouter.get(
  "/stats",
  asyncHandler(async (_req, res) => {
    const [userCounts, totalOrders, activeOrders, deliveredOrders, paidPayments, pharmacyCount, courierCount] =
      await Promise.all([
        prisma.user.groupBy({ by: ["role"], _count: true }),
        prisma.order.count(),
        prisma.order.count({
          where: { status: { notIn: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] } },
        }),
        prisma.order.count({ where: { status: OrderStatus.DELIVERED } }),
        prisma.payment.aggregate({
          where: { status: PaymentStatus.PAID },
          _sum: { amount: true },
        }),
        prisma.pharmacy.count(),
        prisma.courier.count(),
      ]);

    res.json({
      usersByRole: userCounts.map((u) => ({ role: u.role, count: u._count })),
      totalOrders,
      activeOrders,
      deliveredOrders,
      totalRevenue: paidPayments._sum.amount || 0,
      pharmacyCount,
      courierCount,
    });
  })
);

adminRouter.get(
  "/users",
  asyncHandler(async (req, res) => {
    const role = req.query.role as Role | undefined;
    const users = await prisma.user.findMany({
      where: role ? { role } : {},
      include: { pharmacy: true, courier: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(users.map(({ passwordHash, ...u }) => u));
  })
);

const updateUserSchema = z.object({ isActive: z.boolean().optional() });

adminRouter.patch(
  "/users/:id",
  asyncHandler(async (req, res) => {
    const data = updateUserSchema.parse(req.body);
    const user = await prisma.user.update({ where: { id: req.params.id as string }, data });
    const { passwordHash, ...safe } = user;
    res.json(safe);
  })
);

adminRouter.get(
  "/payments",
  asyncHandler(async (_req, res) => {
    const payments = await prisma.payment.findMany({
      include: { order: { include: { client: true, pharmacy: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(payments);
  })
);
