import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { getSupabaseConfigErrorMessage, hasSupabaseConfig } from "@/lib/env";
import { useCreateEventMutation, useInvalidateEventQueries } from "@/lib/events";

export default function NewEventScreen() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [count, setCount] = useState("0");
  const [error, setError] = useState<string | null>(null);

  const createEventMutation = useCreateEventMutation();
  const invalidateEvents = useInvalidateEventQueries();

  if (!hasSupabaseConfig) {
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.eyebrow}>New Event</Text>
        <Text style={styles.title}>Configuration Required</Text>
        <Text style={styles.errorText}>{getSupabaseConfigErrorMessage()}</Text>
      </View>
    );
  }

  const handleCreate = () => {
    const trimmedTitle = title.trim();
    const parsedCount = Number(count);

    if (!trimmedTitle) {
      setError("Title is required");
      return;
    }

    if (!Number.isFinite(parsedCount) || parsedCount < 0) {
      setError("Count must be a non-negative number");
      return;
    }

    setError(null);
    createEventMutation.mutate(
      { title: trimmedTitle, count: parsedCount },
      {
        onSuccess: async () => {
          await invalidateEvents();
          router.back();
        },
        onError: (mutationError) => {
          setError(mutationError.message);
        },
      },
    );
  };

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.eyebrow}>New Event</Text>
      <Text style={styles.title}>Create an event</Text>
      <Text style={styles.description}>
        Provide the event name and initial count to open its first record.
      </Text>

      <View style={styles.formCard}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          placeholder="Morning Run"
          placeholderTextColor="#7a8a9c"
        />

        <Text style={styles.label}>Initial Count</Text>
        <TextInput
          value={count}
          onChangeText={setCount}
          style={styles.input}
          keyboardType="number-pad"
          placeholder="0"
          placeholderTextColor="#7a8a9c"
        />

        {(error || createEventMutation.error) && (
          <Text style={styles.errorText}>
            {error ?? createEventMutation.error?.message ?? "Failed to create event"}
          </Text>
        )}

        <Pressable
          style={[styles.primaryButton, createEventMutation.isPending && styles.buttonDisabled]}
          disabled={createEventMutation.isPending}
          onPress={handleCreate}
        >
          <Text style={styles.primaryButtonText}>
            {createEventMutation.isPending ? "Creating..." : "Create Event"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#0a1525",
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 12,
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
  description: {
    color: "#94a3b8",
    fontSize: 14,
  },
  formCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0f1f34",
    padding: 16,
    gap: 8,
  },
  label: {
    color: "#cbd5e1",
    fontSize: 13,
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
    marginBottom: 8,
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
  primaryButton: {
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
  buttonDisabled: {
    opacity: 0.6,
  },
});
