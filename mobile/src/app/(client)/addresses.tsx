import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing } from "@/constants/theme";
import { api, ApiError } from "@/lib/api";
import { Address } from "@/lib/types";

export default function AddressesScreen() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [form, setForm] = useState({ label: "", street: "", city: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.get<Address[]>("/addresses");
    setAddresses(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/addresses", form);
      setForm({ label: "", street: "", city: "" });
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'ajouter l'adresse");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await api.delete(`/addresses/${id}`);
    load();
  }

  return (
    <Screen onRefresh={load} refreshing={loading}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Mes adresses</Text>

      {addresses.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>Aucune adresse enregistrée.</Text>
      ) : (
        addresses.map((a) => (
          <Card key={a.id} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontWeight: "600", color: colors.text }}>{a.label}</Text>
              <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                {a.street}, {a.city}
              </Text>
            </View>
            <Pressable onPress={() => handleDelete(a.id)}>
              <Text style={{ color: colors.danger, fontSize: 13 }}>Supprimer</Text>
            </Pressable>
          </Card>
        ))
      )}

      <Card style={{ marginTop: Spacing.two }}>
        <Text style={{ fontWeight: "700", color: colors.text }}>Ajouter une adresse</Text>
        <TextField
          label="Libellé"
          placeholder="ex: Domicile"
          value={form.label}
          onChangeText={(v) => setForm((f) => ({ ...f, label: v }))}
        />
        <TextField
          label="Rue / quartier"
          value={form.street}
          onChangeText={(v) => setForm((f) => ({ ...f, street: v }))}
        />
        <TextField label="Ville" value={form.city} onChangeText={(v) => setForm((f) => ({ ...f, city: v }))} />
        {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}
        <Button title="Ajouter" onPress={handleSubmit} loading={submitting} />
      </Card>
    </Screen>
  );
}
