import { resolveEventTitle } from "@targetless/domain";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { formatTimestamp } from "@/lib/date-utils";
import { CompleteRecordModal } from "@/components/events/CompleteRecordModal";
import { EventRecordTimelineItem } from "@/components/events/EventRecordTimelineItem";
import { EventStatusPill } from "@/components/events/EventStatusPill";
import {
  useCompleteEventMutation,
  useCompleteRecordMutation,
  useCreateRecordMutation,
  useDeleteEventMutation,
  useEventDetailQuery,
  useInvalidateEventQueries,
  useUpdateTitleMutation,
} from "@/lib/events";
import { getSupabaseConfigErrorMessage, hasSupabaseConfig } from "@/lib/env";

export default function EventDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const eventId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [editTitle, setEditTitle] = useState(false);
  const [titleInput, setTitleInput] = useState("");
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [newRecordCount, setNewRecordCount] = useState("0");
  const [newRecordNote, setNewRecordNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const detailQuery = useEventDetailQuery(eventId ?? "", !!eventId);
  const completeEventMutation = useCompleteEventMutation();
  const completeRecordMutation = useCompleteRecordMutation();
  const createRecordMutation = useCreateRecordMutation();
  const updateTitleMutation = useUpdateTitleMutation();
  const deleteEventMutation = useDeleteEventMutation();
  const invalidateEvents = useInvalidateEventQueries();

  const event = detailQuery.data;
  const canCreateNewRecord =
    !!event &&
    event.records.length > 0 &&
    event.records.every((record) => record.completed) &&
    !event.completed;

  useEffect(() => {
    if (event) {
      const currentCount = event.currentRecord?.count ?? 0;
      setNewRecordCount(String(currentCount));
    }
  }, [event?.id, event?.currentRecord?.count]);

  const isBusy = useMemo(
    () =>
      completeEventMutation.isPending ||
      completeRecordMutation.isPending ||
      createRecordMutation.isPending ||
      updateTitleMutation.isPending ||
      deleteEventMutation.isPending,
    [
      completeEventMutation.isPending,
      completeRecordMutation.isPending,
      createRecordMutation.isPending,
      updateTitleMutation.isPending,
      deleteEventMutation.isPending,
    ],
  );

  if (!hasSupabaseConfig) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>{getSupabaseConfigErrorMessage()}</Text>
      </View>
    );
  }

  if (!eventId) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>Missing event id.</Text>
      </View>
    );
  }

  if (detailQuery.isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Loading event...</Text>
      </View>
    );
  }

  if (detailQuery.error || !event) {
    return (
      <View style={styles.centeredContainer}>
        <Text style={styles.errorText}>
          {detailQuery.error?.message ?? "Unable to load event."}
        </Text>
      </View>
    );
  }

  const handleCompleteEvent = () => {
    Alert.alert("Complete Event", `Mark \"${event.title}\" as completed?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Complete",
        style: "default",
        onPress: () => {
          completeEventMutation.mutate(
            { eventId: event.id },
            {
              onSuccess: async () => {
                await invalidateEvents(event.id);
              },
              onError: (mutationError) => setError(mutationError.message),
            },
          );
        },
      },
    ]);
  };

  const handleDeleteEvent = () => {
    Alert.alert(
      "Delete Event",
      "This will permanently delete the event and all records.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteEventMutation.mutate(event.id, {
              onSuccess: async () => {
                await invalidateEvents(event.id);
                router.back();
              },
              onError: (mutationError) => setError(mutationError.message),
            });
          },
        },
      ],
    );
  };

  const handleCompleteRecordSubmit = ({ note, createNext, nextCount }: { note?: string; createNext: boolean; nextCount?: number }) => {
    if (!event.currentRecord) {
      return;
    }

    setError(null);
    completeRecordMutation.mutate(
      {
        eventId: event.id,
        createNext,
        nextCount,
        note,
      },
      {
        onSuccess: async () => {
          setShowCompleteModal(false);
          await invalidateEvents(event.id);
        },
        onError: (mutationError) => setError(mutationError.message),
      },
    );
  };

  const handleCreateRecord = () => {
    const parsedCount = Number(newRecordCount);
    if (!Number.isFinite(parsedCount) || parsedCount < 0) {
      setError("Count must be a non-negative number");
      return;
    }

    setError(null);
    createRecordMutation.mutate(
      {
        eventId: event.id,
        count: parsedCount,
        note: newRecordNote.trim() ? newRecordNote.trim() : undefined,
      },
      {
        onSuccess: async () => {
          setNewRecordCount("0");
          setNewRecordNote("");
          await invalidateEvents(event.id);
        },
        onError: (mutationError) => setError(mutationError.message),
      },
    );
  };

  const handleSaveTitle = () => {
    const trimmedTitle = titleInput.trim();
    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }

    setError(null);
    updateTitleMutation.mutate(
      { eventId: event.id, title: trimmedTitle },
      {
        onSuccess: async () => {
          setEditTitle(false);
          await invalidateEvents(event.id);
        },
        onError: (mutationError) => setError(mutationError.message),
      },
    );
  };

  return (
    <ScrollView style={styles.screenContainer} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.eyebrow}>Event Details</Text>
      <Text style={styles.title}>
        {resolveEventTitle(event.title, event.currentRecord?.count)}
      </Text>
      <View style={styles.statusRow}>
        <EventStatusPill completed={event.completed} />
      </View>
      <Text style={styles.meta}>Updated {event.updatedAt ? formatTimestamp(event.updatedAt) : "N/A"}</Text>
      <Text style={styles.meta}>
        {event.records.length} {event.records.length === 1 ? "record" : "records"}
      </Text>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.primaryButton, (event.completed || !event.currentRecord || isBusy) && styles.buttonDisabled]}
          disabled={event.completed || !event.currentRecord || isBusy}
          onPress={() => setShowCompleteModal(true)}
        >
          <Text style={styles.primaryButtonText}>Complete Record</Text>
        </Pressable>

        <Pressable
          style={[styles.secondaryButton, (event.completed || isBusy) && styles.buttonDisabled]}
          disabled={event.completed || isBusy}
          onPress={handleCompleteEvent}
        >
          <Text style={styles.secondaryButtonText}>Complete Event</Text>
        </Pressable>
      </View>

      <CompleteRecordModal
        visible={showCompleteModal}
        currentCount={event.currentRecord?.count ?? 0}
        isPending={completeRecordMutation.isPending}
        error={completeRecordMutation.error?.message}
        onClose={() => setShowCompleteModal(false)}
        onSubmit={handleCompleteRecordSubmit}
      />

      <View style={styles.actionsRow}>
        <Pressable
          style={styles.outlineButton}
          onPress={() => {
            setEditTitle(true);
            setTitleInput(event.title);
          }}
        >
          <Text style={styles.outlineButtonText}>Edit Title</Text>
        </Pressable>

        <Pressable
          style={[styles.dangerButton, isBusy && styles.buttonDisabled]}
          disabled={isBusy}
          onPress={handleDeleteEvent}
        >
          <Text style={styles.dangerButtonText}>Delete Event</Text>
        </Pressable>
      </View>

      {editTitle && (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Rename Event</Text>
          <Text style={styles.meta}>
            Use @count in the title to display the current count value.
          </Text>
          <TextInput
            value={titleInput}
            onChangeText={setTitleInput}
            style={styles.input}
            placeholder="Event title"
            placeholderTextColor="#7a8a9c"
          />
          <Pressable
            style={[styles.primaryButton, updateTitleMutation.isPending && styles.buttonDisabled]}
            disabled={updateTitleMutation.isPending}
            onPress={handleSaveTitle}
          >
            <Text style={styles.primaryButtonText}>Save Title</Text>
          </Pressable>
        </View>
      )}

      {canCreateNewRecord ? (
        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Create New Record</Text>
          <TextInput
            value={newRecordCount}
            onChangeText={setNewRecordCount}
            style={styles.input}
            placeholder="Count"
            keyboardType="number-pad"
            placeholderTextColor="#7a8a9c"
          />
          <TextInput
            value={newRecordNote}
            onChangeText={setNewRecordNote}
            style={[styles.input, styles.textArea]}
            placeholder="Note (optional)"
            placeholderTextColor="#7a8a9c"
            multiline
            numberOfLines={3}
          />
          <Pressable
            style={[styles.primaryButton, createRecordMutation.isPending && styles.buttonDisabled]}
            disabled={createRecordMutation.isPending}
            onPress={handleCreateRecord}
          >
            <Text style={styles.primaryButtonText}>Create Record</Text>
          </Pressable>
        </View>
      ) : null}

      {(error || completeEventMutation.error || completeRecordMutation.error || createRecordMutation.error || updateTitleMutation.error || deleteEventMutation.error) && (
        <Text style={styles.errorText}>
          {error ??
            completeEventMutation.error?.message ??
            completeRecordMutation.error?.message ??
            createRecordMutation.error?.message ??
            updateTitleMutation.error?.message ??
            deleteEventMutation.error?.message ??
            "Operation failed"}
        </Text>
      )}

      <View style={styles.timelinePanel}>
        <Text style={styles.panelTitle}>Records Timeline</Text>
        {event.records.length === 0 ? (
          <Text style={styles.meta}>This event has no records yet.</Text>
        ) : (
          event.records.map((record) => (
            <EventRecordTimelineItem key={record.id} record={record} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#0a1525",
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 10,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a1525",
    paddingHorizontal: 20,
    gap: 8,
  },
  eyebrow: {
    color: "#22d3ee",
    fontSize: 12,
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "700",
  },
  title: {
    color: "#e2e8f0",
    fontSize: 30,
    fontWeight: "800",
  },
  meta: {
    color: "#94a3b8",
    fontSize: 13,
  },
  statusRow: {
    flexDirection: "row",
  },
  actionsRow: {
    marginTop: 6,
    flexDirection: "row",
    gap: 8,
  },
  panel: {
    marginTop: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0f1f34",
    padding: 16,
    gap: 8,
  },
  timelinePanel: {
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0f1f34",
    padding: 16,
    gap: 10,
  },
  panelTitle: {
    color: "#e2e8f0",
    fontSize: 18,
    fontWeight: "700",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#0f172a",
    color: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textArea: {
    minHeight: 84,
    textAlignVertical: "top",
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#0f172a",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  toggleRowActive: {
    borderColor: "#22d3ee",
  },
  toggleDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#64748b",
    backgroundColor: "transparent",
  },
  toggleDotActive: {
    borderColor: "#22d3ee",
    backgroundColor: "#22d3ee",
  },
  toggleText: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "600",
  },
  nextCountPreview: {
    color: "#67e8f9",
    fontSize: 13,
    fontWeight: "600",
  },
  quickOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickOptionButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#0f172a",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  quickOptionText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "700",
  },
  primaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#0891b2",
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#ecfeff",
    fontWeight: "700",
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#14532d",
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#dcfce7",
    fontWeight: "700",
    fontSize: 14,
  },
  outlineButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#0ea5e9",
    backgroundColor: "#082f49",
    paddingVertical: 12,
    alignItems: "center",
  },
  outlineButtonText: {
    color: "#bae6fd",
    fontWeight: "700",
    fontSize: 14,
  },
  dangerButton: {
    flex: 1,
    borderRadius: 12,
    backgroundColor: "#be123c",
    paddingVertical: 12,
    alignItems: "center",
  },
  dangerButtonText: {
    color: "#ffe4e6",
    fontWeight: "700",
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  errorText: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#be123c",
    backgroundColor: "rgba(190, 24, 93, 0.2)",
    color: "#fecdd3",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
  },
});
