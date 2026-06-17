import { useLocalSearchParams } from "expo-router";
import { OrderDetail } from "@/components/OrderDetail";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <OrderDetail orderId={id} />;
}
