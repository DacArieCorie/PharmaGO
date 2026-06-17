import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing } from "@/constants/theme";
import { api } from "@/lib/api";
import { Pharmacy } from "@/lib/types";

export default function PharmaciesScreen() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const router = useRouter();
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const params = q ? `?q=${encodeURIComponent(q)}` : "";
      const data = await api.get<Pharmacy[]>(`/pharmacies${params}`);
      setPharmacies(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <Screen onRefresh={() => load(query)} refreshing={loading}>
      <View style={{ backgroundColor: colors.primary, borderRadius: 16, padding: Spacing.four, gap: Spacing.two }}>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700" }}>Vos médicaments livrés à domicile</Text>
        <Text style={{ color: "#ecfdf5", fontSize: 14 }}>
          Commandez auprès de pharmacies partenaires et payez via Cash, Orange Money, Moov Money ou Wave.
        </Text>
        <TextField
          label=""
          placeholder="Rechercher une pharmacie..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={() => load(query)}
          returnKeyType="search"
          style={{ backgroundColor: "#fff" }}
        />
        <Button title="Rechercher" onPress={() => load(query)} variant="secondary" />
      </View>

      <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text }}>Pharmacies partenaires</Text>

      {!loading && pharmacies.length === 0 && (
        <Text style={{ color: colors.textSecondary }}>Aucune pharmacie trouvée.</Text>
      )}

      {pharmacies.map((pharmacy) => (
        <Pressable key={pharmacy.id} onPress={() => router.push(`/pharmacies/${pharmacy.id}` as never)}>
          <Card>
            <Text style={{ fontWeight: "700", color: colors.text }}>{pharmacy.name}</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>{pharmacy.address}</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>{pharmacy.city}</Text>
            {pharmacy.openingHours && (
              <Text style={{ fontSize: 12, color: colors.primary }}>Horaires : {pharmacy.openingHours}</Text>
            )}
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}
