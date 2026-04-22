import { useEffect, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const NEXT_COUNT_PATTERN = /^([+-]?)(\d+)$/;

function getRealNextCount(currentCount: number, nextCountInput: string): number | null {
  const matches = nextCountInput.match(NEXT_COUNT_PATTERN);
  if (!matches) {
    return null;
  }
  const [, sign, digits] = matches;
  const inputNum = Number(digits);
  if (sign === "+") {
    return currentCount + inputNum;
  }
  if (sign === "-") {
    return currentCount - inputNum;
  }
  return inputNum;
}

export interface CompleteRecordFormArgs {
  note?: string;
  createNext: boolean;
  nextCount?: number;
}

interface CompleteRecordModalProps {
  visible: boolean;
  currentCount: number;
  isPending: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (args: CompleteRecordFormArgs) => void;
}

export function CompleteRecordModal({
  visible,
  currentCount,
  isPending,
  error,
  onClose,
  onSubmit,
}: CompleteRecordModalProps) {
  const [note, setNote] = useState("");
  const [createNextRecord, setCreateNextRecord] = useState(true);
  const [nextCountInput, setNextCountInput] = useState(String(currentCount));
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setNote("");
      setCreateNextRecord(true);
      setNextCountInput(String(currentCount));
      setLocalError(null);
    }
  }, [visible, currentCount]);

  const handleSubmit = () => {
    const resolvedNextCount = createNextRecord
      ? getRealNextCount(currentCount, nextCountInput)
      : undefined;

    if (createNextRecord && resolvedNextCount === null) {
      setLocalError("Enter a valid next count. You can use 10, +1, or -1.");
      return;
    }

    setLocalError(null);
    onSubmit({
      note: note.trim() || undefined,
      createNext: createNextRecord,
      nextCount: resolvedNextCount ?? undefined,
    });
  };

  const displayError = localError ?? error;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <Text style={styles.panelTitle}>Complete Current Record</Text>
          <Text style={styles.meta}>
            Add an optional note and choose whether to open the next record.
          </Text>
          <TextInput
            value={note}
            onChangeText={setNote}
            style={[styles.input, styles.textArea]}
            placeholder="Note (optional)"
            placeholderTextColor="#7a8a9c"
            multiline
            numberOfLines={3}
          />
          <Pressable
            style={[styles.toggleRow, createNextRecord && styles.toggleRowActive]}
            onPress={() => setCreateNextRecord((v) => !v)}
          >
            <View style={[styles.toggleDot, createNextRecord && styles.toggleDotActive]} />
            <Text style={styles.toggleText}>Create next record automatically</Text>
          </Pressable>

          {createNextRecord ? (
            <>
              <TextInput
                value={nextCountInput}
                onChangeText={setNextCountInput}
                style={styles.input}
                placeholder="Next count, e.g. 10, +1, -1"
                placeholderTextColor="#7a8a9c"
              />
              <Text style={styles.nextCountPreview}>
                Next count resolves to{" "}
                {String(getRealNextCount(currentCount, nextCountInput) ?? "-")}
              </Text>
              <View style={styles.quickOptionsRow}>
                {(["+1", "+10", "current", "-1", "-10"] as const).map((option) => (
                  <Pressable
                    key={option}
                    style={styles.quickOptionButton}
                    onPress={() => {
                      if (option === "current") {
                        setNextCountInput(String(currentCount));
                        return;
                      }
                      setNextCountInput(option);
                    }}
                  >
                    <Text style={styles.quickOptionText}>
                      {option === "current" ? `current (${currentCount})` : option}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}

          {displayError ? (
            <Text style={styles.errorText}>{displayError}</Text>
          ) : null}

          <View style={styles.actions}>
            <Pressable style={styles.outlineButton} onPress={onClose}>
              <Text style={styles.outlineButtonText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[styles.primaryButton, isPending && styles.buttonDisabled]}
              disabled={isPending}
              onPress={handleSubmit}
            >
              <Text style={styles.primaryButtonText}>
                {isPending ? "Completing..." : "Complete Record"}
              </Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#0f1f34",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    gap: 12,
  },
  handle: {
    alignSelf: "center",
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: "#334155",
    marginBottom: 8,
  },
  panelTitle: {
    color: "#e2e8f0",
    fontSize: 18,
    fontWeight: "700",
  },
  meta: {
    color: "#94a3b8",
    fontSize: 13,
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
  buttonDisabled: {
    opacity: 0.6,
  },
  actions: {
    marginTop: 4,
    flexDirection: "row",
    gap: 8,
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
