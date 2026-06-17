import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Text, useColorScheme, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { OrderCard } from "@/components/OrderCard";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { Colors, Spacing } from "@/constants/theme";
import { api } from "@/lib/api";
import { formatFCFA, formatDate } from "@/lib/format";
import { Order, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/types";

const STATUS_TIMELINE: Order["status"][] = [
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "ASSIGNED",
  "IN_DELIVERY",
  "DELIVERED",
];

export function OrderDetail({ orderId }: { orderId: string }) {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.get<Order>(`/orders/${orderId}`);
    setOrder(data);
    setLoading(false);
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!order) {
    return (
      <Screen>
        <Text style={{ color: colors.textSecondary, textAlign: "center" }}>Commande introuvable.</Text>
      </Screen>
    );
  }

  const currentStepIndex = STATUS_TIMELINE.indexOf(order.status);
  const isCancelled = order.status === "CANCELLED";

  return (
    <Screen onRefresh={load} refreshing={loading}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Commande #{order.id.slice(0, 8)}</Text>
      <Text style={{ fontSize: 13, color: colors.textSecondary }}>{formatDate(order.createdAt)}</Text>

      {isCancelled ? (
        <Card style={{ borderColor: colors.danger, backgroundColor: `${colors.danger}11` }}>
          <Text style={{ color: colors.danger, fontSize: 13 }}>Cette commande a été annulée.</Text>
        </Card>
      ) : (
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.two }}>
          {STATUS_TIMELINE.map((status, i) => (
            <View
              key={status}
              style={{
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: i <= currentStepIndex ? colors.primary : colors.backgroundElement,
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: i <= currentStepIndex ? "#fff" : colors.textSecondary,
                }}
              >
                {ORDER_STATUS_LABELS[status]}
              </Text>
            </View>
          ))}
        </View>
      )}

      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between", gap: Spacing.two }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700", color: colors.text }}>{order.pharmacy?.name}</Text>
            {order.deliveryAddress && (
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                Livraison : {order.deliveryAddress.label} — {order.deliveryAddress.street}, {order.deliveryAddress.city}
              </Text>
            )}
            {order.courier?.user && (
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Livreur : {order.courier.user.name}</Text>
            )}
          </View>
          <View style={{ alignItems: "flex-end", gap: 4 }}>
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
          </View>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: Spacing.two, gap: 6 }}>
          {order.items.map((item) => (
            <View key={item.id} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 13, color: colors.text }}>
                {item.quantity} × {item.product.name}
              </Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                {formatFCFA(Number(item.unitPrice) * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: Spacing.two, gap: 4 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>Sous-total</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>{formatFCFA(order.itemsTotal)}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>Frais de livraison</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>{formatFCFA(order.deliveryFee)}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "700", color: colors.text }}>Total</Text>
            <Text style={{ fontWeight: "700", color: colors.text }}>{formatFCFA(order.totalAmount)}</Text>
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>Paiement</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</Text>
          </View>
        </View>
      </Card>

      <OrderCard order={order} onUpdated={load} />
    </Screen>
  );
}
