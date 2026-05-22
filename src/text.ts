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

const DESIGN_TERMS = new Set([
  'design',
  'ui',
  'ux',
  'visual',
  'layout',
  'style',
  'styles',
  'color',
  'animation',
]);
const WRITING_TERMS = new Set([
  'writing',
  'copy',
  'docs',
  'readme',
  'documentation',
  'prose',
  'tone',
  'headline',
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
 * Picks a compact category name for newly suggested avoidance constraints.
 */
export function inferCategoryFromText(text: string) {
  const searchTerms = extractSearchTerms(text);
  if (searchTerms.some((word) => DESIGN_TERMS.has(word))) return 'design';
  if (searchTerms.some((word) => WRITING_TERMS.has(word))) return 'writing';
  return DEFAULT_CATEGORY;
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

export class ConstraintValidationError extends Error {
  code = 'positive_only_constraint';
  constructor(message = 'Juice only stores negative avoidance constraints') {
    super(message);
  }
}

const NEGATIVE_RE = /\b(avoid|do not|don't|never|stop|no longer|without|forbid|prohibit)\b/i;
const POSITIVE_RE = /\b(like|love|prefer|use|always)\b/i;

function cleanAvoided(value: string) {
  return compactStatement(value.replace(/[.!?]+$/g, '').trim());
}

export function normalizeNegativeConstraint(statement: string) {
  const text = compactStatement(statement);
  const instead = text.match(/^use\s+(.+?)\s+instead\s+of\s+(.+)$/i);
  if (instead)
    return `Avoid ${cleanAvoided(instead[2])} when ${cleanAvoided(instead[1])} is appropriate`;
  const prefer = text.match(/^prefer\s+(.+?)\s+over\s+(.+)$/i);
  if (prefer)
    return `Avoid ${cleanAvoided(prefer[2])} when ${cleanAvoided(prefer[1])} is appropriate`;
  const rather = text.match(/^(.+?)\s+rather\s+than\s+(.+)$/i);
  if (rather)
    return `Avoid ${cleanAvoided(rather[2])} when ${cleanAvoided(rather[1])} is appropriate`;
  if (NEGATIVE_RE.test(text)) return text;
  if (POSITIVE_RE.test(text) || text) throw new ConstraintValidationError();
  throw new ConstraintValidationError('constraint statement is required');
}
