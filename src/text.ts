import { MAX_CATEGORY, MAX_STATEMENT, MAX_TRIGGER, MAX_TRIGGERS } from './types.js';

const DEFAULT_CATEGORY = 'general';

const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'this',
  'from',
  'should',
  'please',
  'when',
  'about',
]);

const PREFERRED_CATEGORIES = new Set([
  'test',
  'tests',
  'typescript',
  'mcp',
  'sqlite',
  'http',
  'ui',
  'review',
  'commit',
  'style',
]);

/**
 * Normalizes user-controlled text before storing it.
 */
export function compactText(value: string, maxLength: number) {
  return value.trim().replace(/\s+/g, ' ').slice(0, maxLength);
}

/**
 * Extracts simple searchable terms for MVP retrieval.
 *
 * This is deliberately deterministic. Juice can later swap this module for a
 * semantic retrieval strategy without changing the MCP API.
 */
export function extractSearchTerms(text: string) {
  const matches = text.toLowerCase().match(/[a-z0-9][a-z0-9_-]{2,}/g) ?? [];
  return [...new Set(matches.filter((word) => !STOP_WORDS.has(word)))];
}

/**
 * Picks a compact category name for newly suggested taste signals.
 */
export function inferCategoryFromText(text: string) {
  const searchTerms = extractSearchTerms(text);
  const preferredCategory = searchTerms.find((word) => PREFERRED_CATEGORIES.has(word));

  return compactText(preferredCategory ?? searchTerms[0] ?? DEFAULT_CATEGORY, MAX_CATEGORY);
}

/**
 * Produces stable trigger hints for manifests and retrieval.
 */
export function normalizeTriggerHints(triggers: string[]) {
  const normalizedTriggers = triggers
    .map((trigger) => compactText(trigger, MAX_TRIGGER).toLowerCase())
    .filter(Boolean);

  return [...new Set(normalizedTriggers)].slice(0, MAX_TRIGGERS);
}

export function compactStatement(statement: string) {
  return compactText(statement, MAX_STATEMENT);
}

export function compactCategory(category: string) {
  return compactText(category, MAX_CATEGORY);
}
