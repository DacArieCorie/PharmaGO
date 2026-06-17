import { useCallback, useEffect, useState } from "react";
import { Text, useColorScheme } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { OrderCard } from "@/components/OrderCard";
import { Colors, Spacing } from "@/constants/theme";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";

export default function CourierDeliveriesScreen() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Order[]>("/orders");
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const active = orders.filter((o) => o.status === "ASSIGNED" || o.status === "IN_DELIVERY");
  const done = orders.filter((o) => o.status === "DELIVERED");

  return (
    <Screen onRefresh={load} refreshing={loading}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Mes livraisons</Text>

      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginTop: Spacing.two }}>En cours</Text>
      {!loading && active.length === 0 && (
        <Text style={{ color: colors.textSecondary }}>Aucune livraison en cours.</Text>
      )}
      {active.map((order) => (
        <OrderCard key={order.id} order={order} onUpdated={load} />
      ))}

      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text, marginTop: Spacing.two }}>Livrées</Text>
      {!loading && done.length === 0 && (
        <Text style={{ color: colors.textSecondary }}>Aucune livraison terminée.</Text>
      )}
      {done.map((order) => (
        <OrderCard key={order.id} order={order} onUpdated={load} />
      ))}
    </Screen>
  );
}
