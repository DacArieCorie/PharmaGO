import { OrderStatus, ORDER_STATUS_LABELS, PaymentStatus, PAYMENT_STATUS_LABELS } from "@/lib/types";

const ORDER_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  ACCEPTED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-blue-100 text-blue-700",
  READY_FOR_PICKUP: "bg-purple-100 text-purple-700",
  ASSIGNED: "bg-purple-100 text-purple-700",
  IN_DELIVERY: "bg-orange-100 text-orange-700",
  DELIVERED: "bg-emerald-100 text-emerald-700",
  CANCELLED: "bg-red-100 text-red-700",
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  PENDING: "bg-gray-100 text-gray-700",
  PAID: "bg-emerald-100 text-emerald-700",
  FAILED: "bg-red-100 text-red-700",
  REFUNDED: "bg-orange-100 text-orange-700",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${ORDER_COLORS[status]}`}>
      {ORDER_STATUS_LABELS[status]}
    </span>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PAYMENT_COLORS[status]}`}>
      {PAYMENT_STATUS_LABELS[status]}
    </span>
  );
}
