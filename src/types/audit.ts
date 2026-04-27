export interface AuditResult {
  risk: 'alto' | 'medio' | 'bajo';
  reason: string;
  fixSuggestion: string;
  originalBlock?: string;
  codeReplacement?: string;
  line?: number;
  category?: string;
  cwe?: string;
}

export interface Rule {
  id: string;
  language: string;
  pattern: string;
  message: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category?: string;
  cwe?: string;
}
