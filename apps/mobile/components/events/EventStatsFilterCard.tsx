import { Pressable, StyleSheet, Text } from "react-native";

interface EventStatsFilterCardProps {
  label: string;
  value?: number;
  active: boolean;
  onPress: () => void;
}

export function EventStatsFilterCard({
  label,
  value,
  active,
  onPress,
}: EventStatsFilterCardProps) {
  return (
    <Pressable
      style={[styles.statCard, active && styles.statCardActive]}
      onPress={onPress}
    >
      <Text style={[styles.statCardLabel, active && styles.statCardLabelActive]}>
        {label}
      </Text>
      <Text style={[styles.statCardValue, active && styles.statCardValueActive]}>
        {typeof value === "number" ? value : "-"}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
    minWidth: 96,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0f1f34",
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 4,
  },
  statCardActive: {
    borderColor: "#22d3ee",
    backgroundColor: "#083344",
  },
  statCardLabel: {
    color: "#94a3b8",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: "700",
  },
  statCardLabelActive: {
    color: "#67e8f9",
  },
  statCardValue: {
    color: "#e2e8f0",
    fontSize: 24,
    fontWeight: "800",
  },
  statCardValueActive: {
    color: "#ecfeff",
  },
});
