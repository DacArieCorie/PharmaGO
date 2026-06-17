import { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Text, useColorScheme, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors } from "@/constants/theme";
import { api } from "@/lib/api";
import { formatFCFA } from "@/lib/format";
import { Pharmacy, Product } from "@/lib/types";
import { useCart } from "@/lib/cart-context";

export default function PharmacyDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [pharmacy, setPharmacy] = useState<(Pharmacy & { products: Product[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const { addItem, lines } = useCart();

  useEffect(() => {
    api
      .get<Pharmacy & { products: Product[] }>(`/pharmacies/${id}`)
      .then(setPharmacy)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!pharmacy) {
    return (
      <Screen>
        <Text style={{ color: colors.textSecondary, textAlign: "center" }}>Pharmacie introuvable.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Card>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>{pharmacy.name}</Text>
        <Text style={{ color: colors.textSecondary }}>
          {pharmacy.address}, {pharmacy.city}
        </Text>
        <Text style={{ fontSize: 13, color: colors.textSecondary }}>{pharmacy.phone}</Text>
        {pharmacy.openingHours && (
          <Text style={{ fontSize: 13, color: colors.primary }}>Horaires : {pharmacy.openingHours}</Text>
        )}
      </Card>

      <Text style={{ fontSize: 17, fontWeight: "700", color: colors.text }}>Catalogue</Text>

      {pharmacy.products.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>Aucun produit disponible actuellement.</Text>
      ) : (
        pharmacy.products.map((product) => {
          const inCart = lines.find((l) => l.product.id === product.id);
          return (
            <Card key={product.id}>
              <Text style={{ fontWeight: "700", color: colors.text }}>{product.name}</Text>
              {product.category && <Text style={{ fontSize: 12, color: colors.textSecondary }}>{product.category}</Text>}
              {product.description && (
                <Text style={{ fontSize: 13, color: colors.textSecondary }}>{product.description}</Text>
              )}
              {product.isPrescriptionRequired && (
                <Text style={{ fontSize: 12, fontWeight: "600", color: "#ea580c" }}>Ordonnance requise</Text>
              )}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ fontWeight: "700", color: colors.primary }}>{formatFCFA(product.price)}</Text>
                <Button
                  title={product.stock <= 0 ? "Rupture" : inCart ? `Ajouté (${inCart.quantity})` : "Ajouter"}
                  disabled={product.stock <= 0}
                  onPress={() => addItem(product)}
                />
              </View>
            </Card>
          );
        })
      )}
    </Screen>
  );
}
