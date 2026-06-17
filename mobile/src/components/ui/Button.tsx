import { ActivityIndicator, Pressable, StyleSheet, Text, useColorScheme } from "react-native";
import { Colors, Spacing } from "@/constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary" | "danger";
}

export function Button({ title, onPress, disabled, loading, variant = "primary" }: ButtonProps) {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];
  const isDisabled = disabled || loading;

  const backgroundColor =
    variant === "primary" ? colors.primary : variant === "danger" ? colors.danger : colors.backgroundElement;
  const textColor = variant === "secondary" ? colors.text : "#ffffff";

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[styles.button, { backgroundColor, opacity: isDisabled ? 0.6 : 1 }]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.text, { color: textColor }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 10,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
  },
});
