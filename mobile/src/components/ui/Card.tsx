import { ReactNode } from "react";
import { StyleSheet, useColorScheme, View, ViewProps } from "react-native";
import { Colors, Spacing } from "@/constants/theme";

interface CardProps extends ViewProps {
  children: ReactNode;
}

export function Card({ children, style, ...props }: CardProps) {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const colors = Colors[scheme];

  return (
    <View
      style={[styles.card, { backgroundColor: colors.backgroundElement, borderColor: colors.border }, style as object]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: Spacing.three,
    gap: Spacing.two,
  },
});
