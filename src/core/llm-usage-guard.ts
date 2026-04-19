export interface LlmUsageDecision {
  allowed: boolean;
  reason?: string;
}

export interface LlmUsageSnapshot {
  globalCallsLastHour: number;
  fileCallsLastHour: number;
}

export interface LlmUsageState {
  globalCalls: number[];
  fileCalls: Record<string, number[]>;
}

const ONE_HOUR_MS = 60 * 60 * 1000;

export class LlmUsageGuard {
  private globalCalls: number[] = [];
  private fileCalls = new Map<string, number[]>();

  private cleanup(now: number): void {
    const threshold = now - ONE_HOUR_MS;
    this.globalCalls = this.globalCalls.filter(ts => ts >= threshold);

    for (const [fileKey, calls] of this.fileCalls.entries()) {
      const filtered = calls.filter(ts => ts >= threshold);
      if (filtered.length === 0) {
        this.fileCalls.delete(fileKey);
      } else {
        this.fileCalls.set(fileKey, filtered);
      }
    }
  }

  canCall(fileKey: string, maxCallsPerHour: number, maxAuditsPerFilePerHour: number): LlmUsageDecision {
    const now = Date.now();
    this.cleanup(now);

    if (this.globalCalls.length >= maxCallsPerHour) {
      return {
        allowed: false,
        reason: `Limite global por hora alcanzado (${maxCallsPerHour}).`
      };
    }

    const fileSpecific = this.fileCalls.get(fileKey) ?? [];
    if (fileSpecific.length >= maxAuditsPerFilePerHour) {
      return {
        allowed: false,
        reason: `Limite por archivo por hora alcanzado (${maxAuditsPerFilePerHour}).`
      };
    }

    return { allowed: true };
  }

  recordCall(fileKey: string): void {
    const now = Date.now();
    this.cleanup(now);
    this.globalCalls.push(now);

    const fileSpecific = this.fileCalls.get(fileKey) ?? [];
    fileSpecific.push(now);
    this.fileCalls.set(fileKey, fileSpecific);
  }

  getUsageSnapshot(fileKey: string): LlmUsageSnapshot {
    const now = Date.now();
    this.cleanup(now);

    return {
      globalCallsLastHour: this.globalCalls.length,
      fileCallsLastHour: (this.fileCalls.get(fileKey) ?? []).length
    };
  }

  exportState(): LlmUsageState {
    const now = Date.now();
    this.cleanup(now);

    const fileCalls: Record<string, number[]> = {};
    for (const [fileKey, calls] of this.fileCalls.entries()) {
      fileCalls[fileKey] = [...calls];
    }

    return {
      globalCalls: [...this.globalCalls],
      fileCalls
    };
  }

  hydrate(state: Partial<LlmUsageState> | undefined): void {
    if (!state) {
      return;
    }

    const globalCalls = Array.isArray(state.globalCalls)
      ? state.globalCalls.filter(ts => Number.isFinite(ts))
      : [];

    const fileCalls = new Map<string, number[]>();
    const rawFileCalls = state.fileCalls ?? {};
    for (const [fileKey, calls] of Object.entries(rawFileCalls)) {
      if (!Array.isArray(calls)) {
        continue;
      }

      const validCalls = calls.filter(ts => Number.isFinite(ts));
      if (validCalls.length > 0) {
        fileCalls.set(fileKey, validCalls);
      }
    }

    this.globalCalls = globalCalls;
    this.fileCalls = fileCalls;
    this.cleanup(Date.now());
  }
}
