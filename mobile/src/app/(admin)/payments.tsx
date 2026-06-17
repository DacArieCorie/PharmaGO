import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, useColorScheme, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { PaymentStatusBadge } from "@/components/StatusBadge";
import { Colors, Spacing } from "@/constants/theme";
import { api, ApiError } from "@/lib/api";
import { formatFCFA, formatDate } from "@/lib/format";
import { Order, Payment, PAYMENT_METHOD_LABELS } from "@/lib/types";

type PaymentWithOrder = Payment & { createdAt: string; order: Order };

export default function AdminPaymentsScreen() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [payments, setPayments] = useState<PaymentWithOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<PaymentWithOrder[]>("/admin/payments");
      setPayments(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les paiements");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen onRefresh={load} refreshing={loading}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Paiements</Text>

      {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}

      {!loading && payments.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>Aucun paiement.</Text>
      ) : (
        payments.map((p) => (
          <Card key={p.id} style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={{ fontWeight: "700", color: colors.text }}>#{p.order.id.slice(0, 8)}</Text>
              <PaymentStatusBadge status={p.status} />
            </View>

            <View style={styles.line}>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Client</Text>
              <Text style={{ fontSize: 13, color: colors.text }}>{p.order.client?.name ?? "—"}</Text>
            </View>
            <View style={styles.line}>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Pharmacie</Text>
              <Text style={{ fontSize: 13, color: colors.text }}>{p.order.pharmacy?.name ?? "—"}</Text>
            </View>
            <View style={styles.line}>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Méthode</Text>
              <Text style={{ fontSize: 13, color: colors.text }}>{PAYMENT_METHOD_LABELS[p.method]}</Text>
            </View>
            <View style={styles.line}>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Montant</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: colors.text }}>{formatFCFA(p.amount)}</Text>
            </View>
            <View style={styles.line}>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>Date</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>{formatDate(p.createdAt)}</Text>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.one,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.one,
  },
  line: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
