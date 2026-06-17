import { useCallback, useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, useColorScheme, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Colors, Spacing } from "@/constants/theme";
import { api, ApiError } from "@/lib/api";
import { Role, User } from "@/lib/types";

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrateur",
  PHARMACY: "Pharmacie",
  COURIER: "Livreur",
  CLIENT: "Client",
};

const ROLE_FILTERS: (Role | "")[] = ["", "ADMIN", "PHARMACY", "COURIER", "CLIENT"];

export default function AdminUsersScreen() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (filter: Role | "") => {
    setLoading(true);
    setError(null);
    try {
      const query = filter ? `?role=${filter}` : "";
      const data = await api.get<User[]>(`/admin/users${query}`);
      setUsers(data);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de charger les utilisateurs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(roleFilter);
  }, [load, roleFilter]);

  async function toggleActive(user: User) {
    setBusyId(user.id);
    setError(null);
    try {
      await api.patch(`/admin/users/${user.id}`, { isActive: !user.isActive });
      await load(roleFilter);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action impossible");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Screen onRefresh={() => load(roleFilter)} refreshing={loading}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Utilisateurs</Text>

      <View style={styles.chipRow}>
        {ROLE_FILTERS.map((r) => {
          const active = roleFilter === r;
          return (
            <Pressable
              key={r || "all"}
              onPress={() => setRoleFilter(r)}
              style={[
                styles.chip,
                { backgroundColor: active ? colors.primary : colors.backgroundElement },
              ]}
            >
              <Text style={{ color: active ? "#fff" : colors.text, fontSize: 13, fontWeight: "600" }}>
                {r ? ROLE_LABELS[r] : "Tous les rôles"}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}

      {!loading && users.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>Aucun utilisateur.</Text>
      ) : (
        users.map((u) => (
          <Card key={u.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: "700", color: colors.text }}>{u.name}</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                {u.email} · {ROLE_LABELS[u.role]}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end", gap: Spacing.two }}>
              <Badge
                label={u.isActive ? "Actif" : "Désactivé"}
                color={u.isActive ? colors.primary : colors.textSecondary}
              />
              <Pressable onPress={() => toggleActive(u)} disabled={busyId === u.id}>
                <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600", opacity: busyId === u.id ? 0.5 : 1 }}>
                  {u.isActive ? "Désactiver" : "Activer"}
                </Text>
              </Pressable>
            </View>
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
});
