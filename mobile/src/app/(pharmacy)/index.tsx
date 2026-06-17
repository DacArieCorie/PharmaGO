import { useCallback, useEffect, useState } from "react";
import { Text, useColorScheme } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing } from "@/constants/theme";
import { api, ApiError } from "@/lib/api";
import { Pharmacy } from "@/lib/types";

const emptyForm = { name: "", address: "", city: "", phone: "", openingHours: "" };

export default function PharmacyProfileScreen() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Pharmacy>("/pharmacies/me/profile");
      setForm({
        name: data.name,
        address: data.address,
        city: data.city,
        phone: data.phone,
        openingHours: data.openingHours || "",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit() {
    setError(null);
    setSuccess(false);
    setSaving(true);
    try {
      await api.patch("/pharmacies/me/profile", form);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Mise à jour impossible");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen onRefresh={load} refreshing={loading}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Profil de la pharmacie</Text>

      <Card>
        <TextField
          label="Nom de la pharmacie"
          value={form.name}
          onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
        />
        <TextField
          label="Adresse"
          value={form.address}
          onChangeText={(v) => setForm((f) => ({ ...f, address: v }))}
        />
        <TextField label="Ville" value={form.city} onChangeText={(v) => setForm((f) => ({ ...f, city: v }))} />
        <TextField
          label="Téléphone"
          keyboardType="phone-pad"
          value={form.phone}
          onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
        />
        <TextField
          label="Horaires d'ouverture"
          placeholder="ex: Lun-Sam 8h-20h"
          value={form.openingHours}
          onChangeText={(v) => setForm((f) => ({ ...f, openingHours: v }))}
        />

        {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}
        {success && <Text style={{ color: colors.primary, fontSize: 13 }}>Profil mis à jour.</Text>}

        <Button
          title={saving ? "Enregistrement..." : "Enregistrer"}
          onPress={handleSubmit}
          disabled={saving || loading}
          loading={saving}
        />
      </Card>
    </Screen>
  );
}
