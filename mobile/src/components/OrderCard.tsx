import { useState } from "react";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/StatusBadge";
import { Colors, Spacing } from "@/constants/theme";
import { api, ApiError } from "@/lib/api";
import { formatFCFA, formatDate } from "@/lib/format";
import { Order, PAYMENT_METHOD_LABELS } from "@/lib/types";

function ActionButton({ label, onPress, disabled, tone = "primary" }: { label: string; onPress: () => void; disabled?: boolean; tone?: "primary" | "danger" }) {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const background = tone === "danger" ? "transparent" : colors.primary;
  const borderColor = tone === "danger" ? colors.danger : colors.primary;
  const textColor = tone === "danger" ? colors.danger : "#fff";

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.actionButton, { backgroundColor: background, borderColor, opacity: disabled ? 0.6 : 1 }]}
    >
      <Text style={{ color: textColor, fontSize: 13, fontWeight: "600" }}>{label}</Text>
    </Pressable>
  );
}

export function OrderCard({ order, onUpdated }: { order: Order; onUpdated: () => void }) {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function updateStatus(status: string) {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/orders/${order.id}/status`, { status });
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action impossible");
    } finally {
      setBusy(false);
    }
  }

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/orders/${order.id}/pay`);
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Paiement impossible");
    } finally {
      setBusy(false);
    }
  }

  async function confirmDelivery() {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/orders/${order.id}/status`, { status: "DELIVERED", deliveryProof: "Remis au client" });
      onUpdated();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action impossible");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Link href={`/orders/${order.id}` as never}>
            <Text style={[styles.title, { color: colors.text }]}>Commande #{order.id.slice(0, 8)}</Text>
          </Link>
          <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{order.pharmacy?.name}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: 11 }}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={{ alignItems: "flex-end", gap: 4 }}>
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </View>
      </View>

      <View>
        {order.items.map((item) => (
          <Text key={item.id} style={{ color: colors.textSecondary, fontSize: 13 }}>
            {item.quantity} × {item.product.name}
          </Text>
        ))}
      </View>

      <View style={styles.totalRow}>
        <Text style={{ color: colors.primary, fontWeight: "700" }}>{formatFCFA(order.totalAmount)}</Text>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{PAYMENT_METHOD_LABELS[order.paymentMethod]}</Text>
      </View>

      {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}

      <View style={styles.actions}>
        {order.status === "PENDING" && (
          <ActionButton label="Annuler" tone="danger" disabled={busy} onPress={() => updateStatus("CANCELLED")} />
        )}
        {order.paymentMethod !== "CASH" && order.paymentStatus === "PENDING" && order.status !== "CANCELLED" && (
          <ActionButton label={`Payer via ${PAYMENT_METHOD_LABELS[order.paymentMethod]}`} disabled={busy} onPress={pay} />
        )}

        {order.status === "PENDING" && (
          <ActionButton label="Accepter" disabled={busy} onPress={() => updateStatus("ACCEPTED")} />
        )}
        {order.status === "ACCEPTED" && (
          <ActionButton label="Démarrer la préparation" disabled={busy} onPress={() => updateStatus("PREPARING")} />
        )}
        {order.status === "PREPARING" && (
          <ActionButton label="Prête pour collecte" disabled={busy} onPress={() => updateStatus("READY_FOR_PICKUP")} />
        )}

        {order.status === "ASSIGNED" && (
          <ActionButton label="Démarrer la livraison" disabled={busy} onPress={() => updateStatus("IN_DELIVERY")} />
        )}
        {order.status === "IN_DELIVERY" && (
          <ActionButton label="Confirmer la livraison" disabled={busy} onPress={confirmDelivery} />
        )}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.two,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
});
