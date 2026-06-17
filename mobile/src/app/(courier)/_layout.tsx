import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/lib/auth-context";

export default function CourierLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;
  if (user.role !== "COURIER") return <Redirect href="/" />;

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "Livraisons", tabBarIcon: ({ color, size }) => <Ionicons name="bicycle-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen name="orders/[id]" options={{ href: null, title: "Livraison" }} />
    </Tabs>
  );
}
