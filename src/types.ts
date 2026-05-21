export const SCOPES = ['global', 'project', 'repo', 'agent'] as const;
export type Scope = (typeof SCOPES)[number];
export const SCHEMA_VERSION = '1.0';
export type JuiceStatus = 'active' | 'retired';
export type ScopeIdentity = { scope?: Scope; project?: string; repo?: string; agent?: string };
export type JuiceRecord = {
  id: string;
  scope: Scope;
  scope_key: string;
  category: string;
  statement: string;
  triggers: string[];
  confidence: number;
  strength: number;
  status: JuiceStatus;
  created_at: string;
  updated_at: string;
};
export type ManifestArea = { category: string; trigger_hints: string[]; scopes: Scope[] };
export type Manifest = { schema_version: string; areas: ManifestArea[] };
export type Suggestion = {
  scope: Scope;
  scope_key: string;
  category: string;
  statement: string;
  triggers: string[];
  confidence: number;
  strength: number;
};
export type PrepareResult = {
  schema_version: string;
  heading: 'Taste signals to consider';
  relevant: Array<
    Pick<
      JuiceRecord,
      'id' | 'scope' | 'scope_key' | 'category' | 'statement' | 'confidence' | 'strength'
    > & { score: number }
  >;
};
export const MAX_STATEMENT = 1000,
  MAX_CATEGORY = 80,
  MAX_TRIGGER = 80,
  MAX_TRIGGERS = 8;
