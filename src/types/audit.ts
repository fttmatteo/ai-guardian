export interface AuditResult {
  risk: 'alto' | 'medio' | 'bajo';
  reason: string;
  fixSuggestion: string;
}

export interface Rule {
  id: string;
  language: string;
  pattern: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
}
