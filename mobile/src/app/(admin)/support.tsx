import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Colors, Spacing } from "@/constants/theme";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { SupportTicket, TicketStatus } from "@/lib/types";

const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: "Ouvert",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
};

const STATUS_COLORS: Record<TicketStatus, string> = {
  OPEN: "#ea580c",
  IN_PROGRESS: "#2563eb",
  RESOLVED: "#059669",
};

export default function AdminSupportScreen() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<SupportTicket[]>("/support");
      setTickets(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les demandes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: TicketStatus) {
    setBusyId(id);
    setError(null);
    try {
      await api.patch(`/support/${id}`, { status });
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen onRefresh={load} refreshing={loading}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Support</Text>

      {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}

      {!loading && tickets.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>Aucune demande.</Text>
      ) : (
        tickets.map((t) => (
          <Card key={t.id}>
            <View style={styles.headerRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: colors.text }}>{t.subject}</Text>
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  {t.user?.name} ({t.user?.email}) · {formatDate(t.createdAt)}
                </Text>
              </View>
              <Badge label={STATUS_LABELS[t.status]} color={STATUS_COLORS[t.status]} />
            </View>

            <Text style={{ fontSize: 13, color: colors.text }}>{t.message}</Text>

            <View style={styles.actions}>
              {(Object.keys(STATUS_LABELS) as TicketStatus[])
                .filter((s) => s !== t.status)
                .map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => updateStatus(t.id, s)}
                    disabled={busyId === t.id}
                    style={[
                      styles.actionButton,
                      { borderColor: colors.border, opacity: busyId === t.id ? 0.5 : 1 },
                    ]}
                  >
                    <Text style={{ fontSize: 13, color: colors.text }}>
                      Marquer {STATUS_LABELS[s].toLowerCase()}
                    </Text>
                  </Pressable>
                ))}
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.two,
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
