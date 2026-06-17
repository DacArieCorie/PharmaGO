import { useCallback, useEffect, useState } from "react";
import { Pressable, Text, useColorScheme, View } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Colors, Spacing } from "@/constants/theme";
import { api, ApiError } from "@/lib/api";
import { formatFCFA } from "@/lib/format";
import { Product } from "@/lib/types";

const emptyForm = {
  name: "",
  description: "",
  price: "",
  stock: "0",
  category: "",
  isPrescriptionRequired: false,
};

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];

  return (
    <Pressable
      onPress={() => onChange(!value)}
      style={{ flexDirection: "row", alignItems: "center", gap: Spacing.two }}
    >
      <View
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          borderWidth: 1,
          borderColor: value ? colors.primary : colors.border,
          backgroundColor: value ? colors.primary : "transparent",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {value && <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>✓</Text>}
      </View>
      <Text style={{ color: colors.text, fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

export default function ProductsScreen() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get<Product[]>("/products/mine");
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(p: Product) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description || "",
      price: p.price,
      stock: String(p.stock),
      category: p.category || "",
      isPrescriptionRequired: p.isPrescriptionRequired,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    const payload = {
      name: form.name,
      description: form.description || undefined,
      price: Number(form.price),
      stock: Number(form.stock),
      category: form.category || undefined,
      isPrescriptionRequired: form.isPrescriptionRequired,
    };
    try {
      if (editingId) {
        await api.patch(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Action impossible");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeactivate(id: string) {
    await api.delete(`/products/${id}`);
    load();
  }

  return (
    <Screen onRefresh={load} refreshing={loading}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Mon catalogue</Text>

      <Card>
        <Text style={{ fontWeight: "700", color: colors.text }}>
          {editingId ? "Modifier le produit" : "Ajouter un produit"}
        </Text>

        <TextField label="Nom du produit" value={form.name} onChangeText={(v) => setForm((f) => ({ ...f, name: v }))} />
        <TextField
          label="Description"
          multiline
          numberOfLines={3}
          value={form.description}
          onChangeText={(v) => setForm((f) => ({ ...f, description: v }))}
        />
        <View style={{ flexDirection: "row", gap: Spacing.two }}>
          <View style={{ flex: 1 }}>
            <TextField
              label="Prix (FCFA)"
              keyboardType="numeric"
              value={form.price}
              onChangeText={(v) => setForm((f) => ({ ...f, price: v }))}
            />
          </View>
          <View style={{ flex: 1 }}>
            <TextField
              label="Stock"
              keyboardType="numeric"
              value={form.stock}
              onChangeText={(v) => setForm((f) => ({ ...f, stock: v }))}
            />
          </View>
        </View>
        <TextField
          label="Catégorie"
          value={form.category}
          onChangeText={(v) => setForm((f) => ({ ...f, category: v }))}
        />

        <ToggleRow
          label="Ordonnance requise"
          value={form.isPrescriptionRequired}
          onChange={(v) => setForm((f) => ({ ...f, isPrescriptionRequired: v }))}
        />

        {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}

        <View style={{ flexDirection: "row", gap: Spacing.two }}>
          <View style={{ flex: 1 }}>
            <Button
              title={editingId ? "Enregistrer" : "Ajouter"}
              onPress={handleSubmit}
              disabled={submitting || !form.name || !form.price}
              loading={submitting}
            />
          </View>
          {editingId && (
            <View style={{ flex: 1 }}>
              <Button title="Annuler" onPress={resetForm} variant="secondary" disabled={submitting} />
            </View>
          )}
        </View>
      </Card>

      {!loading && products.length === 0 && (
        <Text style={{ color: colors.textSecondary }}>Aucun produit pour le moment.</Text>
      )}

      {products.map((p) => (
        <Card key={p.id} style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontWeight: "600",
                color: p.isActive ? colors.text : colors.textSecondary,
                textDecorationLine: p.isActive ? "none" : "line-through",
              }}
            >
              {p.name}
            </Text>
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              {formatFCFA(p.price)} · Stock : {p.stock}
              {p.category ? ` · ${p.category}` : ""}
              {p.isPrescriptionRequired ? " · Ordonnance requise" : ""}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: Spacing.three }}>
            <Pressable onPress={() => startEdit(p)}>
              <Text style={{ fontSize: 13, color: colors.primary }}>Modifier</Text>
            </Pressable>
            {p.isActive && (
              <Pressable onPress={() => handleDeactivate(p.id)}>
                <Text style={{ fontSize: 13, color: colors.danger }}>Désactiver</Text>
              </Pressable>
            )}
          </View>
        </Card>
      ))}
    </Screen>
  );
}
