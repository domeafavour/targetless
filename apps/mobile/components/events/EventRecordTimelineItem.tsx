import type { EventRecord } from "@targetless/domain";
import { StyleSheet, Text, View } from "react-native";

import { formatTimestamp } from "@/lib/date-utils";

interface EventRecordTimelineItemProps {
  record: EventRecord;
}

export function EventRecordTimelineItem({
  record,
}: EventRecordTimelineItemProps) {
  return (
    <View style={styles.recordItem}>
      <Text style={styles.recordCount}>Count {record.count}</Text>
      <Text style={styles.meta}>Created {formatTimestamp(record.createdAt)}</Text>
      <Text style={styles.meta}>
        Updated {record.updatedAt ? formatTimestamp(record.updatedAt) : "N/A"}
      </Text>
      {record.note ? <Text style={styles.recordNote}>Note: {record.note}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  recordItem: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#0f172a",
    padding: 12,
    gap: 4,
  },
  recordCount: {
    color: "#22d3ee",
    fontSize: 16,
    fontWeight: "700",
  },
  meta: {
    color: "#94a3b8",
    fontSize: 13,
  },
  recordNote: {
    color: "#cbd5e1",
    fontSize: 13,
  },
});
