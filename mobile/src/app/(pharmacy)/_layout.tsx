import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/lib/auth-context";

export default function PharmacyLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;
  if (user.role !== "PHARMACY") return <Redirect href="/" />;

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "Profil", tabBarIcon: ({ color, size }) => <Ionicons name="business-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="products"
        options={{ title: "Catalogue", tabBarIcon: ({ color, size }) => <Ionicons name="medkit-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: "Commandes", tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen name="orders/[id]" options={{ href: null, title: "Commande" }} />
    </Tabs>
  );
}
