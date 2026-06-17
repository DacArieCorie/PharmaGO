export type Role = "ADMIN" | "PHARMACY" | "COURIER" | "CLIENT";

export type OrderStatus =
  | "PENDING"
  | "ACCEPTED"
  | "PREPARING"
  | "READY_FOR_PICKUP"
  | "ASSIGNED"
  | "IN_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export type PaymentMethod = "CASH" | "ORANGE_MONEY" | "MOOV_MONEY" | "WAVE";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";
export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED";

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string | null;
  role: Role;
  isActive?: boolean;
  pharmacy?: Pharmacy | null;
  courier?: Courier | null;
  addresses?: Address[];
}

export interface Pharmacy {
  id: string;
  userId: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  openingHours?: string | null;
  isActive: boolean;
}

export interface Courier {
  id: string;
  userId: string;
  zone?: string | null;
  isAvailable: boolean;
  user?: User;
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
}

export interface Product {
  id: string;
  pharmacyId: string;
  name: string;
  description?: string | null;
  price: string;
  stock: number;
  category?: string | null;
  isPrescriptionRequired: boolean;
  isActive: boolean;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  product: Product;
}

export interface Payment {
  id: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: string;
  transactionRef?: string | null;
}

export interface Order {
  id: string;
  clientId: string;
  pharmacyId: string;
  courierId?: string | null;
  status: OrderStatus;
  itemsTotal: string;
  deliveryFee: string;
  totalAmount: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  deliveryProof?: string | null;
  createdAt: string;
  items: OrderItem[];
  pharmacy: Pharmacy;
  courier?: Courier | null;
  client?: User;
  deliveryAddress?: Address | null;
  payments: Payment[];
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
  user?: User;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  ACCEPTED: "Acceptée",
  PREPARING: "En préparation",
  READY_FOR_PICKUP: "Prête pour collecte",
  ASSIGNED: "Livreur assigné",
  IN_DELIVERY: "En livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Cash à la livraison",
  ORANGE_MONEY: "Orange Money",
  MOOV_MONEY: "Moov Money",
  WAVE: "Wave",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "En attente",
  PAID: "Payé",
  FAILED: "Échoué",
  REFUNDED: "Remboursé",
};
