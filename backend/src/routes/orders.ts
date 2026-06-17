import { Router } from "express";
import { z } from "zod";
import { OrderStatus, PaymentMethod, PaymentStatus, Role } from "@prisma/client";
import { prisma } from "../lib/prisma";
import { requireAuth, requireRole } from "../middleware/auth";
import { asyncHandler } from "../middleware/errorHandler";

export const ordersRouter = Router();
ordersRouter.use(requireAuth);

const DEFAULT_DELIVERY_FEE = 1000; // FCFA, flat fee for MVP

const createOrderSchema = z.object({
  pharmacyId: z.string().uuid(),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().positive() })).min(1),
  deliveryAddressId: z.string().uuid().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod),
});

ordersRouter.post(
  "/",
  requireRole(Role.CLIENT),
  asyncHandler(async (req, res) => {
    const data = createOrderSchema.parse(req.body);

    const products = await prisma.product.findMany({
      where: { id: { in: data.items.map((i) => i.productId) }, pharmacyId: data.pharmacyId, isActive: true },
    });
    if (products.length !== data.items.length) {
      return res.status(400).json({ error: "Un ou plusieurs produits sont invalides" });
    }

    let itemsTotal = 0;
    const orderItemsData = data.items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitPrice = Number(product.price);
      itemsTotal += unitPrice * item.quantity;
      return { productId: product.id, quantity: item.quantity, unitPrice };
    });

    const order = await prisma.order.create({
      data: {
        clientId: req.user!.userId,
        pharmacyId: data.pharmacyId,
        deliveryAddressId: data.deliveryAddressId,
        paymentMethod: data.paymentMethod,
        itemsTotal,
        deliveryFee: DEFAULT_DELIVERY_FEE,
        totalAmount: itemsTotal + DEFAULT_DELIVERY_FEE,
        items: { create: orderItemsData },
        payments: {
          create: {
            method: data.paymentMethod,
            amount: itemsTotal + DEFAULT_DELIVERY_FEE,
            status: PaymentStatus.PENDING,
          },
        },
      },
      include: { items: { include: { product: true } }, payments: true, pharmacy: true },
    });

    res.status(201).json(order);
  })
);

function visibilityFilter(userId: string, role: Role) {
  if (role === Role.CLIENT) return { clientId: userId };
  if (role === Role.ADMIN) return {};
  // For PHARMACY/COURIER, resolved by caller with pharmacyId/courierId lookups
  return {};
}

ordersRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { role, userId } = req.user!;
    let where: Record<string, unknown> = {};

    if (role === Role.CLIENT) {
      where = { clientId: userId };
    } else if (role === Role.PHARMACY) {
      const pharmacy = await prisma.pharmacy.findUnique({ where: { userId } });
      if (!pharmacy) return res.json([]);
      where = { pharmacyId: pharmacy.id };
    } else if (role === Role.COURIER) {
      const courier = await prisma.courier.findUnique({ where: { userId } });
      if (!courier) return res.json([]);
      where = { courierId: courier.id };
    } else {
      where = visibilityFilter(userId, role);
    }

    const status = req.query.status as OrderStatus | undefined;
    if (status) where = { ...where, status };

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: { include: { product: true } },
        pharmacy: true,
        courier: { include: { user: true } },
        client: true,
        deliveryAddress: true,
        payments: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(orders);
  })
);

async function loadOrderForUser(orderId: string, userId: string, role: Role) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: { include: { product: true } },
      pharmacy: true,
      courier: { include: { user: true } },
      client: true,
      deliveryAddress: true,
      payments: true,
    },
  });
  if (!order) return null;

  if (role === Role.CLIENT && order.clientId !== userId) return null;
  if (role === Role.PHARMACY) {
    const pharmacy = await prisma.pharmacy.findUnique({ where: { userId } });
    if (!pharmacy || order.pharmacyId !== pharmacy.id) return null;
  }
  if (role === Role.COURIER) {
    const courier = await prisma.courier.findUnique({ where: { userId } });
    if (!courier || order.courierId !== courier.id) return null;
  }
  return order;
}

ordersRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const order = await loadOrderForUser(req.params.id as string, req.user!.userId, req.user!.role);
    if (!order) return res.status(404).json({ error: "Commande introuvable" });
    res.json(order);
  })
);

const ALLOWED_TRANSITIONS: Record<Role, Record<OrderStatus, OrderStatus[]>> = {
  [Role.PHARMACY]: {
    [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
    [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING],
    [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP],
    [OrderStatus.READY_FOR_PICKUP]: [],
    [OrderStatus.ASSIGNED]: [],
    [OrderStatus.IN_DELIVERY]: [],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  },
  [Role.COURIER]: {
    [OrderStatus.PENDING]: [],
    [OrderStatus.ACCEPTED]: [],
    [OrderStatus.PREPARING]: [],
    [OrderStatus.READY_FOR_PICKUP]: [],
    [OrderStatus.ASSIGNED]: [OrderStatus.IN_DELIVERY],
    [OrderStatus.IN_DELIVERY]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  },
  [Role.ADMIN]: {
    [OrderStatus.PENDING]: [OrderStatus.ACCEPTED, OrderStatus.CANCELLED],
    [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
    [OrderStatus.PREPARING]: [OrderStatus.READY_FOR_PICKUP, OrderStatus.CANCELLED],
    [OrderStatus.READY_FOR_PICKUP]: [OrderStatus.ASSIGNED, OrderStatus.CANCELLED],
    [OrderStatus.ASSIGNED]: [OrderStatus.IN_DELIVERY, OrderStatus.CANCELLED],
    [OrderStatus.IN_DELIVERY]: [OrderStatus.DELIVERED],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  },
  [Role.CLIENT]: {
    [OrderStatus.PENDING]: [OrderStatus.CANCELLED],
    [OrderStatus.ACCEPTED]: [],
    [OrderStatus.PREPARING]: [],
    [OrderStatus.READY_FOR_PICKUP]: [],
    [OrderStatus.ASSIGNED]: [],
    [OrderStatus.IN_DELIVERY]: [],
    [OrderStatus.DELIVERED]: [],
    [OrderStatus.CANCELLED]: [],
  },
};

const statusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  deliveryProof: z.string().optional(),
});

ordersRouter.patch(
  "/:id/status",
  asyncHandler(async (req, res) => {
    const { status: nextStatus, deliveryProof } = statusSchema.parse(req.body);
    const { role, userId } = req.user!;

    const order = await loadOrderForUser(req.params.id as string, userId, role);
    if (!order) return res.status(404).json({ error: "Commande introuvable" });

    const allowed = ALLOWED_TRANSITIONS[role]?.[order.status] || [];
    if (!allowed.includes(nextStatus)) {
      return res.status(400).json({ error: `Transition ${order.status} -> ${nextStatus} non autorisée pour ce rôle` });
    }

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: {
        status: nextStatus,
        ...(deliveryProof && { deliveryProof }),
        ...(nextStatus === OrderStatus.DELIVERED &&
          order.paymentMethod === PaymentMethod.CASH && {
            paymentStatus: PaymentStatus.PAID,
            payments: { updateMany: { where: { orderId: order.id }, data: { status: PaymentStatus.PAID } } },
          }),
      },
      include: { items: { include: { product: true } }, pharmacy: true, courier: { include: { user: true } } },
    });

    res.json(updated);
  })
);

const assignSchema = z.object({ courierId: z.string().uuid() });

ordersRouter.patch(
  "/:id/assign",
  requireRole(Role.ADMIN),
  asyncHandler(async (req, res) => {
    const { courierId } = assignSchema.parse(req.body);
    const order = await prisma.order.findUnique({ where: { id: req.params.id as string } });
    if (!order) return res.status(404).json({ error: "Commande introuvable" });
    if (order.status !== OrderStatus.READY_FOR_PICKUP) {
      return res.status(400).json({ error: "La commande doit être prête pour l'assignation" });
    }
    const courier = await prisma.courier.findUnique({ where: { id: courierId } });
    if (!courier) return res.status(404).json({ error: "Livreur introuvable" });

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { courierId, status: OrderStatus.ASSIGNED },
      include: { courier: { include: { user: true } } },
    });
    res.json(updated);
  })
);

ordersRouter.post(
  "/:id/pay",
  asyncHandler(async (req, res) => {
    const order = await loadOrderForUser(req.params.id as string, req.user!.userId, req.user!.role);
    if (!order) return res.status(404).json({ error: "Commande introuvable" });
    if (order.paymentMethod === PaymentMethod.CASH) {
      return res.status(400).json({ error: "Le paiement cash est confirmé à la livraison" });
    }
    // Simulated mobile money confirmation (Phase 1: no live API integration yet)
    const transactionRef = `SIM-${Date.now()}`;
    await prisma.payment.updateMany({
      where: { orderId: order.id },
      data: { status: PaymentStatus.PAID, transactionRef },
    });
    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: PaymentStatus.PAID },
      include: { payments: true },
    });
    res.json(updated);
  })
);
