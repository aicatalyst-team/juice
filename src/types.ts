export const SCOPES = ['global', 'project', 'repo', 'agent'] as const;
export type Scope = (typeof SCOPES)[number];

export const SCHEMA_VERSION = '1.0';
export const MAX_STATEMENT = 1000;
export const MAX_CATEGORY = 80;
export const MAX_TRIGGER = 80;
export const MAX_TRIGGERS = 8;

export type JuiceStatus = 'active' | 'retired';

export type ScopeIdentity = {
  scope?: Scope;
  project?: string;
  repo?: string;
  agent?: string;
};

export type JuiceRecord = {
  id: string;
  kind: 'negative';
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

export type ManifestArea = {
  category: string;
  trigger_hints: string[];
  scopes: Scope[];
};

export type JuiceCategory = {
  name: string;
  trigger_hints: string[];
  created_at: string;
  updated_at: string;
};

export type Manifest = {
  schema_version: string;
  areas: ManifestArea[];
};

export type Suggestion = {
  kind: 'negative';
  scope: Scope;
  scope_key: string;
  category: string;
  statement: string;
  triggers: string[];
  confidence: number;
  strength: number;
};

type PreparedSignal = Pick<
  JuiceRecord,
  'id' | 'scope' | 'scope_key' | 'category' | 'statement' | 'confidence' | 'strength'
> & { score: number };

export type PrepareResult = {
  schema_version: string;
  heading: 'Avoidance constraints to respect';
  relevant: PreparedSignal[];
};
