import * as assert from 'assert';
import * as extension from '../../extension';

suite('Smoke Tests', () => {
    test('extension exports activation methods', () => {
        assert.strictEqual(typeof extension.activate, 'function');
        assert.strictEqual(typeof extension.deactivate, 'function');
    });
});
