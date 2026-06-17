import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing } from "@/constants/theme";
import { api } from "@/lib/api";
import { formatFCFA } from "@/lib/format";
import { Role } from "@/lib/types";

interface Stats {
  usersByRole: { role: Role; count: number }[];
  totalOrders: number;
  activeOrders: number;
  deliveredOrders: number;
  totalRevenue: number;
  pharmacyCount: number;
  courierCount: number;
}

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateurs",
  PHARMACY: "Pharmacies",
  COURIER: "Livreurs",
  CLIENT: "Clients",
};

function StatCard({ label, value }: { label: string; value: string | number }) {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];

  return (
    <Card style={styles.statCard}>
      <Text style={{ fontSize: 13, color: colors.textSecondary }}>{label}</Text>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>{value}</Text>
    </Card>
  );
}

export default function AdminStatsScreen() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Stats>("/admin/stats");
      setStats(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (!stats) {
    return (
      <Screen onRefresh={load} refreshing={loading}>
        {loading ? (
          <View style={{ paddingVertical: Spacing.five, alignItems: "center" }}>
            <ActivityIndicator size="large" />
          </View>
        ) : (
          <Text style={{ color: colors.textSecondary, textAlign: "center" }}>Chargement...</Text>
        )}
      </Screen>
    );
  }

  const cards = [
    { label: "Commandes totales", value: stats.totalOrders },
    { label: "Commandes actives", value: stats.activeOrders },
    { label: "Commandes livrées", value: stats.deliveredOrders },
    { label: "Revenu total", value: formatFCFA(stats.totalRevenue) },
    { label: "Pharmacies", value: stats.pharmacyCount },
    { label: "Livreurs", value: stats.courierCount },
  ];

  return (
    <Screen onRefresh={load} refreshing={loading}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Tableau de bord</Text>

      <View style={styles.grid}>
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} />
        ))}
      </View>

      <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text, marginTop: Spacing.two }}>
        Utilisateurs par rôle
      </Text>

      <View style={styles.grid}>
        {stats.usersByRole.map((u) => (
          <StatCard key={u.role} label={ROLE_LABELS[u.role]} value={u.count} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.three,
  },
  statCard: {
    flexBasis: "47%",
    flexGrow: 1,
  },
});
