import { useCallback, useEffect, useState } from "react";
import { Text, useColorScheme } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { OrderCard } from "@/components/OrderCard";
import { Colors } from "@/constants/theme";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";

export function OrdersListScreen() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.get<Order[]>("/orders");
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen onRefresh={load} refreshing={loading}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Mes commandes</Text>
      {orders.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>Aucune commande pour le moment.</Text>
      ) : (
        orders.map((order) => <OrderCard key={order.id} order={order} onUpdated={load} />)
      )}
    </Screen>
  );
}
