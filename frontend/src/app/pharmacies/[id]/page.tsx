import { PharmacyDetail } from "./PharmacyDetail";

export default async function PharmacyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PharmacyDetail pharmacyId={id} />;
}
