// Objectif : décrire les types de l’API métier publique.
import type { JevProvider } from './jev.mjs';
export type SourceRecord = {
  id: string;
  text: string;
  source: { url: string; date: string };
  [key: string]: unknown;
};
export const DECISIONS: Readonly<Record<string, string>>;
export function activityCase(input: any): SourceRecord;
export function matchEmissionFactor(
  input: any,
  provider: JevProvider,
  options?: { lang?: 'fr' | 'en' | 'es' },
): Promise<any>;
export function runCli(argv: string[], io?: { log(value: string): void }): Promise<void>;

export type CompatibilityTarget = {
  activityUnit: string;
  geography: string;
  year: number;
  scope: string;
};
export type FactorCandidate = {
  id: string;
  activityUnit?: string | null;
  geographies?: string[] | null;
  validFrom?: number | null;
  validTo?: number | null;
  scope?: string | null;
  source?: { url: string; date: string; [key: string]: unknown };
  [key: string]: unknown;
};
export type CompatibilityReceipt = {
  version: number;
  eligibleIds: string[];
  rejected: { id: string; reasons: string[] }[];
  missingMetadata: { id: string; fields: string[] }[];
  requiresReview: boolean;
};
export function screenFactorCandidates(record: {
  compatibility: CompatibilityTarget;
  candidates: FactorCandidate[];
}): { candidates: FactorCandidate[]; receipt: CompatibilityReceipt };
