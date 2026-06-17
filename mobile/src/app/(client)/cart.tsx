import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { Pressable, Text, TextInput, useColorScheme, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing } from "@/constants/theme";
import { useCart } from "@/lib/cart-context";
import { api, ApiError } from "@/lib/api";
import { formatFCFA } from "@/lib/format";
import { Address, Order, PaymentMethod, PAYMENT_METHOD_LABELS } from "@/lib/types";

const DELIVERY_FEE = 1000;

export default function CartScreen() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const { lines, setQuantity, removeItem, clear, total, pharmacyId } = useCart();
  const router = useRouter();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressId, setAddressId] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<Address[]>("/addresses").then((data) => {
      setAddresses(data);
      if (data.length > 0) setAddressId(data[0].id);
    });
  }, []);

  async function handleCheckout() {
    if (!pharmacyId) return;
    if (!addressId) {
      setError("Veuillez ajouter une adresse de livraison.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const order = await api.post<Order>("/orders", {
        pharmacyId,
        items: lines.map((l) => ({ productId: l.product.id, quantity: l.quantity })),
        deliveryAddressId: addressId,
        paymentMethod,
      });
      clear();
      router.push(`/orders/${order.id}` as never);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible de passer la commande");
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <Screen>
        <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: Spacing.six }}>
          Votre panier est vide.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Votre panier</Text>

      {lines.map((line) => (
        <Card key={line.product.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ fontWeight: "600", color: colors.text }}>{line.product.name}</Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>{formatFCFA(line.product.price)} / unité</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.two }}>
            <TextInput
              keyboardType="number-pad"
              value={String(line.quantity)}
              onChangeText={(v) => setQuantity(line.product.id, Number(v) || 0)}
              style={{
                width: 48,
                textAlign: "center",
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 6,
                color: colors.text,
                paddingVertical: 4,
              }}
            />
            <Pressable onPress={() => removeItem(line.product.id)}>
              <Text style={{ color: colors.danger, fontSize: 13 }}>Retirer</Text>
            </Pressable>
          </View>
        </Card>
      ))}

      <Card>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: colors.textSecondary }}>Sous-total</Text>
          <Text style={{ color: colors.textSecondary }}>{formatFCFA(total)}</Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ color: colors.textSecondary }}>Frais de livraison</Text>
          <Text style={{ color: colors.textSecondary }}>{formatFCFA(DELIVERY_FEE)}</Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            borderTopWidth: 1,
            borderTopColor: colors.border,
            paddingTop: Spacing.two,
          }}
        >
          <Text style={{ fontWeight: "700", color: colors.text }}>Total</Text>
          <Text style={{ fontWeight: "700", color: colors.text }}>{formatFCFA(total + DELIVERY_FEE)}</Text>
        </View>
      </Card>

      <View>
        <Text style={{ fontSize: 13, fontWeight: "500", color: colors.textSecondary, marginBottom: Spacing.one }}>
          Adresse de livraison
        </Text>
        {addresses.length === 0 ? (
          <Text style={{ fontSize: 13, color: colors.textSecondary }}>
            Aucune adresse enregistrée. Ajoutez-en une depuis l'onglet Adresses.
          </Text>
        ) : (
          <View style={{ gap: Spacing.two }}>
            {addresses.map((a) => (
              <Pressable
                key={a.id}
                onPress={() => setAddressId(a.id)}
                style={{
                  borderWidth: 1,
                  borderRadius: 8,
                  padding: Spacing.two,
                  borderColor: addressId === a.id ? colors.primary : colors.border,
                  backgroundColor: addressId === a.id ? `${colors.primary}11` : "transparent",
                }}
              >
                <Text style={{ color: colors.text, fontSize: 13 }}>
                  {a.label} — {a.street}, {a.city}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      <View>
        <Text style={{ fontSize: 13, fontWeight: "500", color: colors.textSecondary, marginBottom: Spacing.one }}>
          Moyen de paiement
        </Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: Spacing.two }}>
          {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
            <Pressable
              key={method}
              onPress={() => setPaymentMethod(method)}
              style={{
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: Spacing.three,
                paddingVertical: Spacing.two,
                borderColor: paymentMethod === method ? colors.primary : colors.border,
                backgroundColor: paymentMethod === method ? `${colors.primary}11` : "transparent",
              }}
            >
              <Text style={{ fontSize: 13, color: paymentMethod === method ? colors.primary : colors.text }}>
                {PAYMENT_METHOD_LABELS[method]}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}

      <Button
        title={submitting ? "Validation..." : "Valider la commande"}
        onPress={handleCheckout}
        disabled={submitting || addresses.length === 0}
      />
    </Screen>
  );
}
