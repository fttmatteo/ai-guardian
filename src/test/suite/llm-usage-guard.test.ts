import * as assert from 'assert';
import { LlmUsageGuard } from '../../core/llm-usage-guard';

suite('Llm Usage Guard', () => {
    test('permite llamadas dentro de limites', () => {
        const guard = new LlmUsageGuard();
        const decision = guard.canCall('file://a.ts', 3, 2);

        assert.strictEqual(decision.allowed, true);
    });

    test('bloquea por limite global', () => {
        const guard = new LlmUsageGuard();
        const fileA = 'file://a.ts';
        const fileB = 'file://b.ts';

        guard.recordCall(fileA);
        guard.recordCall(fileB);

        const decision = guard.canCall(fileA, 2, 10);

        assert.strictEqual(decision.allowed, false);
        assert.ok((decision.reason ?? '').includes('Limite global'));
    });

    test('bloquea por limite por archivo', () => {
        const guard = new LlmUsageGuard();
        const fileA = 'file://a.ts';

        guard.recordCall(fileA);

        const decision = guard.canCall(fileA, 10, 1);

        assert.strictEqual(decision.allowed, false);
        assert.ok((decision.reason ?? '').includes('Limite por archivo'));
    });

    test('snapshot refleja consumo por hora', () => {
        const guard = new LlmUsageGuard();
        const fileA = 'file://a.ts';
        const fileB = 'file://b.ts';

        guard.recordCall(fileA);
        guard.recordCall(fileA);
        guard.recordCall(fileB);

        const snapshotA = guard.getUsageSnapshot(fileA);
        const snapshotB = guard.getUsageSnapshot(fileB);

        assert.strictEqual(snapshotA.globalCallsLastHour, 3);
        assert.strictEqual(snapshotA.fileCallsLastHour, 2);
        assert.strictEqual(snapshotB.fileCallsLastHour, 1);
    });

    test('exporta e hidrata estado de uso', () => {
        const originalGuard = new LlmUsageGuard();
        const fileA = 'file://a.ts';
        const fileB = 'file://b.ts';

        originalGuard.recordCall(fileA);
        originalGuard.recordCall(fileA);
        originalGuard.recordCall(fileB);

        const state = originalGuard.exportState();
        const hydratedGuard = new LlmUsageGuard();
        hydratedGuard.hydrate(state);

        const snapshotA = hydratedGuard.getUsageSnapshot(fileA);
        const snapshotB = hydratedGuard.getUsageSnapshot(fileB);

        assert.strictEqual(snapshotA.globalCallsLastHour, 3);
        assert.strictEqual(snapshotA.fileCallsLastHour, 2);
        assert.strictEqual(snapshotB.fileCallsLastHour, 1);
    });
});
