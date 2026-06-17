import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/lib/auth-context";
import { CartProvider } from "@/lib/cart-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" options={{ headerShown: true, title: "Connexion" }} />
          <Stack.Screen name="register" options={{ headerShown: true, title: "Créer un compte" }} />
          <Stack.Screen name="(client)" />
          <Stack.Screen name="(pharmacy)" />
          <Stack.Screen name="(courier)" />
          <Stack.Screen name="(admin)" />
        </Stack>
      </CartProvider>
    </AuthProvider>
  );
}
