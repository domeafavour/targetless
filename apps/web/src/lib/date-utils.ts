import { parseTimestamp } from "@targetless/shared";

export function formatTimestamp(value: string) {
  const date = parseTimestamp(value);
  if (!date) {
    return "just now";
  }

  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
