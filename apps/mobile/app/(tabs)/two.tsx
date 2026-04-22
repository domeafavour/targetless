import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuthStatusQuery, useCurrentUserQuery, useSignOutMutation } from "@/lib/auth";
import { getSupabaseConfigErrorMessage, hasSupabaseConfig } from "@/lib/env";
import { useEventStatsQuery } from "@/lib/events";

export default function AccountScreen() {
  const authStatus = useAuthStatusQuery();
  const userQuery = useCurrentUserQuery(authStatus.data === true);
  const statsQuery = useEventStatsQuery(authStatus.data === true);
  const signOutMutation = useSignOutMutation();

  if (!hasSupabaseConfig) {
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.description}>Mobile app configuration is incomplete.</Text>
        <Text style={styles.description}>{getSupabaseConfigErrorMessage()}</Text>
      </View>
    );
  }

  if (authStatus.isLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator size="large" color="#06b6d4" />
      </View>
    );
  }

  if (!authStatus.data) {
    return (
      <View style={styles.screenContainer}>
        <Text style={styles.title}>Account</Text>
        <Text style={styles.description}>Sign in from the Events tab to access your data.</Text>
      </View>
    );
  }

  return (
    <View style={styles.screenContainer}>
      <Text style={styles.eyebrow}>Account</Text>
      <Text style={styles.title}>Session & Stats</Text>
      <Text style={styles.description}>{userQuery.data?.email ?? "Signed in"}</Text>

      <View style={styles.statsCard}>
        <Text style={styles.statsLabel}>Total Events</Text>
        <Text style={styles.statsValue}>{statsQuery.data?.total ?? 0}</Text>

        <Text style={styles.statsLabel}>Active Events</Text>
        <Text style={styles.statsValue}>{statsQuery.data?.active ?? 0}</Text>

        <Text style={styles.statsLabel}>Completed Events</Text>
        <Text style={styles.statsValue}>{statsQuery.data?.completed ?? 0}</Text>
      </View>

      <Pressable
        style={[styles.signOutButton, signOutMutation.isPending && styles.buttonDisabled]}
        disabled={signOutMutation.isPending}
        onPress={() => signOutMutation.mutate()}
      >
        <Text style={styles.signOutButtonText}>
          {signOutMutation.isPending ? "Signing out..." : "Sign Out"}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#0a1525",
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0a1525",
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
    fontSize: 28,
    fontWeight: "800",
  },
  description: {
    color: "#94a3b8",
    fontSize: 14,
  },
  statsCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#1e293b",
    backgroundColor: "#0f1f34",
    padding: 16,
    gap: 6,
  },
  statsLabel: {
    color: "#94a3b8",
    fontSize: 13,
  },
  statsValue: {
    color: "#e2e8f0",
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  signOutButton: {
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: "#be123c",
    paddingVertical: 12,
    alignItems: "center",
  },
  signOutButtonText: {
    color: "#ffe4e6",
    fontSize: 14,
    fontWeight: "700",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
