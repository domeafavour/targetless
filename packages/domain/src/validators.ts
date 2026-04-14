/**
 * Validate and normalise a title string.
 * Throws if blank after trimming.
 */
export function validateTitle(raw: string): string {
  const title = raw.trim();
  if (!title) {
    throw new Error("Title is required");
  }
  return title;
}

/**
 * Validate and normalise a count value.
 * Throws if the resulting number is not a finite non-negative number.
 */
export function validateCount(raw: number | string): number {
  const count = Number(raw);
  if (!Number.isFinite(count) || count < 0) {
    throw new Error("Count must be a non-negative number");
  }
  return count;
}

/**
 * Normalise an optional note string.
 * Returns null when blank.
 */
export function normaliseNote(raw: string | null | undefined): string | null {
  const note = raw?.trim() ?? "";
  return note || null;
}
