import { Badge } from "@/components/ui/Badge";
import { OrderStatus, ORDER_STATUS_LABELS, PaymentStatus, PAYMENT_STATUS_LABELS } from "@/lib/types";

const ORDER_COLORS: Record<OrderStatus, string> = {
  PENDING: "#6b7280",
  ACCEPTED: "#2563eb",
  PREPARING: "#2563eb",
  READY_FOR_PICKUP: "#7c3aed",
  ASSIGNED: "#7c3aed",
  IN_DELIVERY: "#ea580c",
  DELIVERED: "#059669",
  CANCELLED: "#dc2626",
};

const PAYMENT_COLORS: Record<PaymentStatus, string> = {
  PENDING: "#6b7280",
  PAID: "#059669",
  FAILED: "#dc2626",
  REFUNDED: "#ea580c",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge label={ORDER_STATUS_LABELS[status]} color={ORDER_COLORS[status]} />;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <Badge label={PAYMENT_STATUS_LABELS[status]} color={PAYMENT_COLORS[status]} />;
}
