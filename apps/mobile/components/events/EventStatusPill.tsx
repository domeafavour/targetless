import { StyleSheet, Text, View } from "react-native";

interface EventStatusPillProps {
  completed: boolean;
}

export function EventStatusPill({ completed }: EventStatusPillProps) {
  return (
    <View
      style={[
        styles.statusPill,
        completed ? styles.completedPill : styles.activePill,
      ]}
    >
      <Text
        style={[
          styles.statusPillText,
          completed ? styles.completedPillText : styles.activePillText,
        ]}
      >
        {completed ? "Completed" : "Active"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  activePill: {
    backgroundColor: "rgba(6, 182, 212, 0.18)",
  },
  completedPill: {
    backgroundColor: "rgba(16, 185, 129, 0.18)",
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  activePillText: {
    color: "#a5f3fc",
  },
  completedPillText: {
    color: "#bbf7d0",
  },
});
