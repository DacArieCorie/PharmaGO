import { useCallback, useEffect, useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { Colors, Spacing } from "@/constants/theme";
import { api, ApiError } from "@/lib/api";
import { formatFCFA, formatDate } from "@/lib/format";
import { Courier, Order, OrderStatus, ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS } from "@/lib/types";

const STATUS_FILTERS: (OrderStatus | "")[] = [
  "",
  "PENDING",
  "ACCEPTED",
  "PREPARING",
  "READY_FOR_PICKUP",
  "ASSIGNED",
  "IN_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

function AssignCourier({
  order,
  couriers,
  onAssigned,
}: {
  order: Order;
  couriers: Courier[];
  onAssigned: () => void;
}) {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [courierId, setCourierId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function assign() {
    if (!courierId) return;
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/orders/${order.id}/assign`, { courierId });
      setCourierId("");
      onAssigned();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Assignation impossible");
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={[styles.assignBox, { backgroundColor: colors.backgroundElement }]}>
      <Text style={{ fontSize: 12, fontWeight: "600", color: colors.textSecondary }}>Assigner un livreur</Text>

      {couriers.length === 0 ? (
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>Aucun livreur disponible.</Text>
      ) : (
        <View style={{ gap: Spacing.one }}>
          {couriers.map((c) => {
            const active = courierId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCourierId(c.id)}
                style={[
                  styles.courierRow,
                  {
                    backgroundColor: active ? colors.primary : colors.background,
                    borderColor: active ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 13, color: active ? "#fff" : colors.text, fontWeight: "600" }}>
                  {c.user?.name ?? "Livreur"}
                  {c.zone ? ` (${c.zone})` : ""}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}

      {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}

      <Pressable
        onPress={assign}
        disabled={busy || !courierId}
        style={[
          styles.assignButton,
          { backgroundColor: colors.primary, opacity: busy || !courierId ? 0.5 : 1 },
        ]}
      >
        <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Assigner</Text>
      </Pressable>
    </View>
  );
}

export default function AdminOrdersScreen() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [orders, setOrders] = useState<Order[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (filter: OrderStatus | "") => {
    setLoading(true);
    setError(null);
    try {
      const query = filter ? `?status=${filter}` : "";
      const [ordersData, couriersData] = await Promise.all([
        api.get<Order[]>(`/orders${query}`),
        api.get<Courier[]>("/couriers"),
      ]);
      setOrders(ordersData);
      setCouriers(couriersData);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les commandes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(statusFilter);
  }, [load, statusFilter]);

  return (
    <Screen onRefresh={() => load(statusFilter)} refreshing={loading}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Commandes</Text>

      <View style={styles.chipRow}>
        {STATUS_FILTERS.map((s) => {
          const active = statusFilter === s;
          return (
            <Pressable
              key={s || "all"}
              onPress={() => setStatusFilter(s)}
              style={[
                styles.chip,
                { backgroundColor: active ? colors.primary : colors.backgroundElement },
              ]}
            >
              <Text style={{ color: active ? "#fff" : colors.text, fontSize: 13, fontWeight: "600" }}>
                {s ? ORDER_STATUS_LABELS[s] : "Tous les statuts"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}

      {!loading && orders.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>Aucune commande.</Text>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Link href={`/orders/${order.id}` as never}>
                  <Text style={{ fontWeight: "700", color: colors.text, fontSize: 15 }}>
                    Commande #{order.id.slice(0, 8)}
                  </Text>
                </Link>
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>{order.pharmacy?.name}</Text>
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>{formatDate(order.createdAt)}</Text>
              </View>
              <View style={{ alignItems: "flex-end", gap: 4 }}>
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
              </View>
            </View>

            <View style={styles.totalRow}>
              <Text style={{ color: colors.primary, fontWeight: "700" }}>{formatFCFA(order.totalAmount)}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                {PAYMENT_METHOD_LABELS[order.paymentMethod]}
              </Text>
            </View>

            {order.status === "READY_FOR_PICKUP" && (
              <AssignCourier order={order} couriers={couriers} onAssigned={() => load(statusFilter)} />
            )}
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assignBox: {
    borderRadius: 10,
    padding: Spacing.two,
    gap: Spacing.two,
  },
  courierRow: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.two,
  },
  assignButton: {
    borderRadius: 8,
    paddingVertical: Spacing.two,
    alignItems: "center",
  },
});
