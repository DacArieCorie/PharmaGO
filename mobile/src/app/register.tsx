import { useState } from "react";
import { Link, useRouter } from "expo-router";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Colors, Spacing } from "@/constants/theme";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api";

const ROLE_HOME: Record<string, string> = {
  PHARMACY: "/(pharmacy)",
  COURIER: "/(courier)",
  CLIENT: "/(client)",
};

const ROLES = [
  { value: "CLIENT", label: "Client" },
  { value: "PHARMACY", label: "Pharmacie" },
  { value: "COURIER", label: "Livreur" },
] as const;

export default function RegisterScreen() {
  const { register } = useAuth();
  const router = useRouter();
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [role, setRole] = useState<"CLIENT" | "PHARMACY" | "COURIER">("CLIENT");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    pharmacyName: "",
    pharmacyAddress: "",
    pharmacyCity: "",
    zone: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const user = await register({
        role,
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone || undefined,
        ...(role === "PHARMACY" && {
          pharmacyName: form.pharmacyName,
          pharmacyAddress: form.pharmacyAddress,
          pharmacyCity: form.pharmacyCity,
        }),
        ...(role === "COURIER" && { zone: form.zone }),
      });
      router.replace((ROLE_HOME[user.role] || "/(client)") as never);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Inscription impossible");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <Text style={{ fontSize: 24, fontWeight: "700", color: colors.text }}>Créer un compte</Text>

      <View style={{ flexDirection: "row", gap: Spacing.two }}>
        {ROLES.map((r) => (
          <Pressable
            key={r.value}
            onPress={() => setRole(r.value)}
            style={{
              flex: 1,
              borderRadius: 8,
              paddingVertical: Spacing.two,
              alignItems: "center",
              backgroundColor: role === r.value ? colors.primary : colors.backgroundElement,
            }}
          >
            <Text style={{ color: role === r.value ? "#fff" : colors.text, fontWeight: "600", fontSize: 13 }}>
              {r.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <TextField label="Nom complet" value={form.name} onChangeText={(v) => update("name", v)} />
      <TextField
        label="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={form.email}
        onChangeText={(v) => update("email", v)}
      />
      <TextField
        label="Mot de passe"
        secureTextEntry
        value={form.password}
        onChangeText={(v) => update("password", v)}
      />
      <TextField label="Téléphone" value={form.phone} onChangeText={(v) => update("phone", v)} />

      {role === "PHARMACY" && (
        <>
          <TextField
            label="Nom de la pharmacie"
            value={form.pharmacyName}
            onChangeText={(v) => update("pharmacyName", v)}
          />
          <TextField label="Adresse" value={form.pharmacyAddress} onChangeText={(v) => update("pharmacyAddress", v)} />
          <TextField label="Ville" value={form.pharmacyCity} onChangeText={(v) => update("pharmacyCity", v)} />
        </>
      )}

      {role === "COURIER" && (
        <TextField label="Zone de couverture" value={form.zone} onChangeText={(v) => update("zone", v)} />
      )}

      {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}

      <Button title={submitting ? "Création..." : "Créer mon compte"} onPress={handleSubmit} loading={submitting} />

      <Link href="/login" style={{ textAlign: "center", color: colors.primary, marginTop: Spacing.two }}>
        Déjà inscrit ? Se connecter
      </Link>
    </Screen>
  );
}
