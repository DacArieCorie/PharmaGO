import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { Text, useColorScheme } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/(admin)",
  PHARMACY: "/(pharmacy)",
  COURIER: "/(courier)",
  CLIENT: "/(client)",
};

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const user = await login(email, password);
      router.replace((ROLE_HOME[user.role] || "/(client)") as never);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Connexion impossible");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>Connexion</Text>

      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField label="Mot de passe" secureTextEntry value={password} onChangeText={setPassword} />

      {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}

      <Button title={submitting ? "Connexion..." : "Se connecter"} onPress={handleSubmit} loading={submitting} />

      <Link href="/register" style={{ textAlign: "center", color: colors.primary, marginTop: Spacing.two }}>
        Pas encore de compte ? Créer un compte
      </Link>

      <Card style={{ marginTop: Spacing.four }}>
        <Text style={{ fontSize: 12, fontWeight: "700", color: colors.text }}>
          Comptes de démonstration (mot de passe : password123)
        </Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>admin@pharmago.africa</Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>pharmacie.centrale@pharmago.africa</Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>livreur.koffi@pharmago.africa</Text>
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>client.demo@pharmago.africa</Text>
      </Card>
    </Screen>
  );
}
