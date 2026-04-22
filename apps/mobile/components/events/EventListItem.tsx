import type { EventWithCurrentRecord } from "@targetless/domain";
import { resolveEventTitle } from "@targetless/domain";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { formatTimestamp } from "@/lib/date-utils";
import { EventStatusPill } from "@/components/events/EventStatusPill";

interface EventListItemProps {
  event: EventWithCurrentRecord;
  isCompleting: boolean;
  onCompleteRecord: () => void;
}

export function EventListItem({
  event,
  isCompleting,
  onCompleteRecord,
}: EventListItemProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>
        {resolveEventTitle(event.title, event.currentRecord?.count)}
      </Text>
      <View style={styles.statusRow}>
        <EventStatusPill completed={event.completed} />
      </View>
      <Text style={styles.cardMeta}>Created {formatTimestamp(event.createdAt)}</Text>
      <Text style={styles.cardMeta}>
        Updated {event.updatedAt ? formatTimestamp(event.updatedAt) : "N/A"}
      </Text>
      <Text style={styles.cardCount}>
        Current Count: {event.currentRecord?.count ?? "-"}
      </Text>
      {event.currentRecord?.note ? (
        <Text style={styles.cardNote}>Note: {event.currentRecord.note}</Text>
      ) : null}

      <View style={styles.cardActionsRow}>
        <Link href={{ pathname: "/events/[id]", params: { id: event.id } }} asChild>
          <Pressable style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>View Records</Text>
          </Pressable>
        </Link>
        <Pressable
          style={[
            styles.successButton,
            (!event.currentRecord || event.completed || isCompleting) &&
              styles.buttonDisabled,
          ]}
          disabled={!event.currentRecord || event.completed || isCompleting}
          onPress={onCompleteRecord}
        >
          <Text style={styles.successButtonText}>Complete Record</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: "#0f1f34",
    borderColor: "#1e293b",
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 4,
  },
  cardTitle: {
    color: "#e2e8f0",
    fontSize: 20,
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    marginTop: 4,
    marginBottom: 2,
  },
  cardMeta: {
    color: "#94a3b8",
    fontSize: 12,
  },
  cardCount: {
    color: "#22d3ee",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 6,
  },
  cardNote: {
    color: "#cbd5e1",
    fontSize: 13,
  },
  cardActionsRow: {
    marginTop: 10,
    flexDirection: "row",
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0ea5e9",
    backgroundColor: "#082f49",
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#bae6fd",
    fontWeight: "700",
    fontSize: 13,
  },
  successButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#166534",
    paddingVertical: 12,
    alignItems: "center",
  },
  successButtonText: {
    color: "#dcfce7",
    fontWeight: "700",
    fontSize: 13,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
