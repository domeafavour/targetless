import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { CompleteRecordModal } from "@/components/events/CompleteRecordModal";
import { EventListItem } from "@/components/events/EventListItem";
import { EventStatsFilterCard } from "@/components/events/EventStatsFilterCard";
import type { EventWithCurrentRecord } from "@targetless/domain";
import {
  useAuthStatusQuery,
  useSignInMutation,
  useSignUpMutation,
} from "@/lib/auth";
import { getSupabaseConfigErrorMessage, hasSupabaseConfig } from "@/lib/env";
import {
  useCompleteRecordMutation,
  useEventStatsQuery,
  useEventsListQuery,
  useInvalidateEventQueries,
} from "@/lib/events";

export default function EventsScreen() {
  const router = useRouter();
  const [filter, setFilter] = useState<"total" | "active" | "completed">(
    "active",
  );
  const [sortField, setSortField] = useState<"createdAt" | "updatedAt">(
    "createdAt",
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn");
  const [authError, setAuthError] = useState<string | null>(null);
  const [selectedEventForComplete, setSelectedEventForComplete] = useState<EventWithCurrentRecord | null>(null);

  const statusQuery = useAuthStatusQuery();
  const invalidateEvents = useInvalidateEventQueries();
  const signInMutation = useSignInMutation();
  const signUpMutation = useSignUpMutation();
  const completeRecordMutation = useCompleteRecordMutation();

  const eventsQuery = useEventsListQuery(
    { filter, sortField, sortOrder },
    statusQuery.data === true,
  );
  const statsQuery = useEventStatsQuery(statusQuery.data === true);

  const isAuthenticating = signInMutation.isPending || signUpMutation.isPending;

  const authMutation = authMode === "signIn" ? signInMutation : signUpMutation;

  if (!hasSupabaseConfig) {
    return (
      <View style={styles.authContainer}>
        <Text style={styles.authEyebrow}>Configuration Required</Text>
        <Text style={styles.authTitle}>Mobile app is missing Supabase config</Text>
        <Text style={styles.authDescription}>
          Add the Expo public environment variables and restart the app.
        </Text>
        <Text style={styles.errorText}>{getSupabaseConfigErrorMessage()}</Text>
      </View>
    );
  }

  const authActionText =
    authMode === "signIn"
      ? isAuthenticating
        ? "Signing in..."
        : "Sign In"
      : isAuthenticating
        ? "Creating account..."
        : "Sign Up";

  const eventCountLabel = useMemo(() => {
    const count = eventsQuery.data?.length ?? 0;
    if (count === 1) {
      return "1 event";
    }
    return `${count} events`;
  }, [eventsQuery.data?.length]);

  const emptyStateText =
    filter === "total"
      ? "No events yet."
      : filter === "active"
        ? "No active events."
        : "No completed events.";

  const handleAuthSubmit = () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setAuthError("Email and password are required.");
      return;
    }

    setAuthError(null);
    authMutation.mutate(
      { email: trimmedEmail, password },
      {
        onError: (error) => {
          setAuthError(error.message);
        },
      },
    );
  };

  if (statusQuery.isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
        <Text style={styles.loadingText}>Checking session...</Text>
      </View>
    );
  }

  if (!statusQuery.data) {
    return (
      <KeyboardAvoidingView
        style={styles.authKeyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.authContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.authCard}>
            <Text style={styles.authEyebrow}>Targetless</Text>
            <Text style={styles.authTitle}>Sign in to track your events</Text>
            <Text style={styles.authDescription}>
              Use your existing web account. Mobile and web data stay in sync.
            </Text>

            <View style={styles.authModeRow}>
              <Pressable
                style={[
                  styles.modeButton,
                  authMode === "signIn" && styles.modeButtonActive,
                ]}
                onPress={() => setAuthMode("signIn")}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    authMode === "signIn" && styles.modeButtonTextActive,
                  ]}
                >
                  Sign In
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modeButton,
                  authMode === "signUp" && styles.modeButtonActive,
                ]}
                onPress={() => setAuthMode("signUp")}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    authMode === "signUp" && styles.modeButtonTextActive,
                  ]}
                >
                  Sign Up
                </Text>
              </Pressable>
            </View>

            <View style={styles.authFieldGroup}>
              <Text style={styles.authFieldLabel}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                textContentType="emailAddress"
                placeholderTextColor="#7a8a9c"
              />
            </View>

            <View style={styles.authFieldGroup}>
              <Text style={styles.authFieldLabel}>Password</Text>
              <TextInput
                value={password}
                onChangeText={setPassword}
                style={styles.input}
                placeholder="Password"
                textContentType="password"
                secureTextEntry
                placeholderTextColor="#7a8a9c"
              />
            </View>

            {(authError || authMutation.error) && (
              <Text style={styles.errorText}>
                {authError ?? authMutation.error?.message ?? "Authentication failed"}
              </Text>
            )}

            <Pressable
              style={[styles.authSubmitButton, isAuthenticating && styles.buttonDisabled]}
              disabled={isAuthenticating}
              onPress={handleAuthSubmit}
            >
              <Text style={styles.primaryButtonText}>{authActionText}</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <FlatList
        data={eventsQuery.data ?? []}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={eventsQuery.isRefetching}
            onRefresh={eventsQuery.refetch}
            tintColor="#06b6d4"
          />
        }
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <Text style={styles.eyebrow}>Event Dashboard</Text>
            <Text style={styles.title}>Stay on top of every commitment</Text>
            <Text style={styles.description}>
              {eventCountLabel}. Complete records and keep progress moving.
            </Text>

            <View style={styles.controlsRow}>
              <Pressable
                style={styles.primaryButton}
                onPress={() => router.push("/events/new")}
              >
                <Text style={styles.primaryButtonText}>Create Event</Text>
              </Pressable>
              <Pressable
                style={styles.secondaryButton}
                onPress={() =>
                  setSortOrder((value) => (value === "asc" ? "desc" : "asc"))
                }
              >
                <Text style={styles.secondaryButtonText}>
                  Sort: {sortOrder.toUpperCase()}
                </Text>
              </Pressable>
            </View>

            <View style={styles.filterRow}>
              {([
                {
                  key: "active",
                  label: "Active",
                  value: statsQuery.data?.active,
                },
                {
                  key: "completed",
                  label: "Completed",
                  value: statsQuery.data?.completed,
                },
                {
                  key: "total",
                  label: "Total",
                  value: statsQuery.data?.total,
                },
              ] as const).map((item) => (
                <EventStatsFilterCard
                  key={item.key}
                  label={item.label}
                  value={item.value}
                  active={filter === item.key}
                  onPress={() => setFilter(item.key)}
                />
              ))}
            </View>

            <View style={styles.filterRow}>
              <Pressable
                style={styles.filterButton}
                onPress={() =>
                  setSortField((value) =>
                    value === "createdAt" ? "updatedAt" : "createdAt",
                  )
                }
              >
                <Text style={styles.filterText}>
                  {sortField === "createdAt" ? "By Created" : "By Updated"}
                </Text>
              </Pressable>
            </View>

            {eventsQuery.error && (
              <Text style={styles.errorText}>{eventsQuery.error.message}</Text>
            )}

            {eventsQuery.isLoading && (
              <View style={styles.inlineLoading}>
                <ActivityIndicator color="#06b6d4" />
                <Text style={styles.loadingText}>Loading events...</Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          !eventsQuery.isLoading ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>{emptyStateText}</Text>
              <Text style={styles.emptyDescription}>
                Pull to refresh or create a new event to start tracking records.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <EventListItem
            event={item}
            isCompleting={completeRecordMutation.isPending}
            onCompleteRecord={() => setSelectedEventForComplete(item)}
          />
        )}
      />
      <CompleteRecordModal
        visible={!!selectedEventForComplete}
        currentCount={selectedEventForComplete?.currentRecord?.count ?? 0}
        isPending={completeRecordMutation.isPending}
        error={completeRecordMutation.error?.message}
        onClose={() => setSelectedEventForComplete(null)}
        onSubmit={({ note, createNext, nextCount }) => {
          if (!selectedEventForComplete?.currentRecord) return;
          completeRecordMutation.mutate(
            {
              eventId: selectedEventForComplete.id,
              createNext,
              nextCount,
              note,
            },
            {
              onSuccess: async () => {
                setSelectedEventForComplete(null);
                await invalidateEvents(selectedEventForComplete.id);
              },
            },
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#0a1525",
  },
  listContent: {
    paddingBottom: 24,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 14,
    gap: 12,
  },
  eyebrow: {
    color: "#22d3ee",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontWeight: "700",
  },
  title: {
    color: "#e2e8f0",
    fontSize: 26,
    fontWeight: "800",
  },
  description: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
  },
  controlsRow: {
    flexDirection: "row",
    gap: 8,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filterButton: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  filterButtonActive: {
    backgroundColor: "#083344",
    borderColor: "#0891b2",
  },
  filterText: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  filterTextActive: {
    color: "#67e8f9",
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
  buttonDisabled: {
    opacity: 0.6,
  },
  centeredContainer: {
    flex: 1,
    backgroundColor: "#0a1525",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  inlineLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 14,
  },
  authKeyboardContainer: {
    flex: 1,
    backgroundColor: "#0a1525",
  },
  authContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: "center",
  },
  authCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#1e3a5f",
    backgroundColor: "#0b1b31",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    gap: 10,
  },
  authEyebrow: {
    color: "#22d3ee",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 2,
    fontWeight: "700",
  },
  authTitle: {
    color: "#e2e8f0",
    fontSize: 28,
    fontWeight: "800",
  },
  authDescription: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  authModeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  modeButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#111827",
    paddingVertical: 10,
    alignItems: "center",
  },
  modeButtonActive: {
    borderColor: "#22d3ee",
    backgroundColor: "#083344",
  },
  modeButtonText: {
    color: "#94a3b8",
    fontWeight: "700",
    fontSize: 13,
  },
  modeButtonTextActive: {
    color: "#67e8f9",
  },
  authFieldGroup: {
    gap: 6,
  },
  authFieldLabel: {
    color: "#9fb5ce",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.4,
  },
  authSubmitButton: {
    borderRadius: 12,
    backgroundColor: "#0891b2",
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 6,
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
  emptyState: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0f1f34",
    padding: 16,
    gap: 6,
  },
  emptyTitle: {
    color: "#e2e8f0",
    fontSize: 18,
    fontWeight: "700",
  },
  emptyDescription: {
    color: "#94a3b8",
    fontSize: 14,
  },
});
