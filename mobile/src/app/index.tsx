import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuth } from "@/lib/auth-context";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/(admin)",
  PHARMACY: "/(pharmacy)",
  COURIER: "/(courier)",
  CLIENT: "/(client)",
};

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) return <Redirect href="/login" />;

  return <Redirect href={(ROLE_HOME[user.role] || "/(client)") as never} />;
}
