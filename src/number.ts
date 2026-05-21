export const DEFAULT_CONFIDENCE = 0.7;
export const DEFAULT_STRENGTH = 0.7;
export const DEFAULT_PREPARE_LIMIT = 5;
export const MAX_PREPARE_LIMIT = 10;

/**
 * Confidence and strength are normalized scores. Clamp external input so a bad
 * value cannot dominate relevance ranking.
 */
export function clampUnitScore(value: unknown, fallback: number) {
  const numericValue = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.max(0, Math.min(1, numericValue));
}

/**
 * Keeps prepare responses compact enough for agent context windows.
 */
export function clampPrepareLimit(value: unknown) {
  const numericValue =
    typeof value === 'number' && Number.isFinite(value) ? Math.floor(value) : DEFAULT_PREPARE_LIMIT;

  return Math.max(1, Math.min(MAX_PREPARE_LIMIT, numericValue));
}
