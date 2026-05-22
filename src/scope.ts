import type { ScopeIdentity } from './types.js';

type CanonicalScopeIdentity = Required<Pick<ScopeIdentity, 'scope'>> & ScopeIdentity;

const SCOPED_IDENTITY_FIELDS = ['project', 'repo', 'agent'] as const;

/**
 * Returns one unambiguous scope for an operation.
 *
 * Callers may either pass `scope` explicitly, or pass exactly one scoped
 * identity field (`project`, `repo`, or `agent`). If neither is present, Juice
 * treats the operation as global. If several scoped identities are present
 * without an explicit scope, we reject it instead of guessing.
 */
export function canonicalizeScopeIdentity(identity: ScopeIdentity = {}): CanonicalScopeIdentity {
  if (identity.scope) {
    return { ...identity, scope: identity.scope };
  }

  const presentScopedFields = SCOPED_IDENTITY_FIELDS.filter((field) => Boolean(identity[field]));

  if (presentScopedFields.length > 1) {
    throw new Error(`ambiguous scope identity: ${presentScopedFields.join(', ')}`);
  }

  if (presentScopedFields.length === 1) {
    return { ...identity, scope: presentScopedFields[0] };
  }

  return { ...identity, scope: 'global' };
}

/**
 * Converts scope identity fields into the stable key used in SQLite.
 */
export function createScopeKey(identity: ScopeIdentity): string {
  const canonicalIdentity = canonicalizeScopeIdentity(identity);

  if (canonicalIdentity.scope === 'global') {
    return 'global';
  }

  const scopedValue = canonicalIdentity[canonicalIdentity.scope];
  if (!scopedValue) {
    throw new Error(`${canonicalIdentity.scope} identity is required`);
  }

  return `${canonicalIdentity.scope}:${scopedValue}`;
}

/**
 * Returns every scope key that may apply while preparing avoidance constraints.
 * Global constraints always participate as a fallback.
 */
export function createAllowedScopeKeys(identity: ScopeIdentity) {
  return new Set(
    [
      'global',
      identity.project && `project:${identity.project}`,
      identity.repo && `repo:${identity.repo}`,
      identity.agent && `agent:${identity.agent}`,
    ].filter(Boolean) as string[],
  );
}
