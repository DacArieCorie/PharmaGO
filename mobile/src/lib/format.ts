export function formatFCFA(amount: number | string): string {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return `${value.toLocaleString("fr-FR")} FCFA`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });
}
