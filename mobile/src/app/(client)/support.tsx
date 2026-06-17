import { useCallback, useEffect, useState } from "react";
import { Text, useColorScheme } from "react-native";
import { Screen } from "@/components/ui/Screen";
import { TextField } from "@/components/ui/TextField";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Colors, Spacing } from "@/constants/theme";
import { api, ApiError } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { SupportTicket } from "@/lib/types";

const STATUS_LABELS: Record<SupportTicket["status"], string> = {
  OPEN: "Ouvert",
  IN_PROGRESS: "En cours",
  RESOLVED: "Résolu",
};

const STATUS_COLORS: Record<SupportTicket["status"], string> = {
  OPEN: "#ea580c",
  IN_PROGRESS: "#2563eb",
  RESOLVED: "#059669",
};

export default function SupportScreen() {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await api.get<SupportTicket[]>("/support");
    setTickets(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      await api.post("/support", { subject, message });
      setSubject("");
      setMessage("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Impossible d'envoyer la demande");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen onRefresh={load} refreshing={loading}>
      <Text style={{ fontSize: 22, fontWeight: "700", color: colors.text }}>Assistance</Text>

      <Card>
        <Text style={{ fontWeight: "700", color: colors.text }}>Nouvelle demande</Text>
        <TextField label="Sujet" value={subject} onChangeText={setSubject} />
        <TextField
          label="Message"
          value={message}
          onChangeText={setMessage}
          multiline
          numberOfLines={4}
          style={{ minHeight: 90, textAlignVertical: "top" }}
        />
        {error && <Text style={{ color: colors.danger, fontSize: 13 }}>{error}</Text>}
        <Button title={submitting ? "Envoi..." : "Envoyer"} onPress={handleSubmit} loading={submitting} />
      </Card>

      <Text style={{ fontWeight: "700", color: colors.text, marginTop: Spacing.two }}>Mes demandes</Text>
      {tickets.length === 0 ? (
        <Text style={{ color: colors.textSecondary }}>Aucune demande pour le moment.</Text>
      ) : (
        tickets.map((t) => (
          <Card key={t.id}>
            <Text style={{ fontWeight: "600", color: colors.text }}>{t.subject}</Text>
            <Badge label={STATUS_LABELS[t.status]} color={STATUS_COLORS[t.status]} />
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>{t.message}</Text>
            <Text style={{ fontSize: 11, color: colors.textSecondary }}>{formatDate(t.createdAt)}</Text>
          </Card>
        ))
      )}
    </Screen>
  );
}
