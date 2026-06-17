import { Ionicons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
import { Tabs } from "expo-router/js-tabs";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/lib/auth-context";

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;
  if (user.role !== "ADMIN") return <Redirect href="/" />;

  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "Stats", tabBarIcon: ({ color, size }) => <Ionicons name="stats-chart-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="users"
        options={{ title: "Utilisateurs", tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="orders"
        options={{ title: "Commandes", tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="payments"
        options={{ title: "Paiements", tabBarIcon: ({ color, size }) => <Ionicons name="cash-outline" size={size} color={color} /> }}
      />
      <Tabs.Screen
        name="support"
        options={{ title: "Support", tabBarIcon: ({ color, size }) => <Ionicons name="help-buoy-outline" size={size} color={color} /> }}
      />
    </Tabs>
  );
}
