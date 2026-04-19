import * as assert from 'assert';
import { detectAiCodeInsertion } from '../../core/change-detector';

suite('Change Detector', () => {
    test('detecta insercion grande de IA', () => {
        const fakeEvent = {
            contentChanges: [
                {
                    text: [
                        'linea 1',
                        'linea 2',
                        'linea 3',
                        'linea 4',
                        'linea 5',
                        'linea 6 con suficiente contenido para superar el minimo de caracteres requerido por la heuristica',
                        'linea 7 mas contenido para que supere 200 caracteres en total cuando se concatena este bloque de texto de prueba para el detector'
                    ].join('\n'),
                    rangeLength: 0
                }
            ]
        } as any;

        const result = detectAiCodeInsertion(fakeEvent);
        assert.ok(result);
    });

    test('ignora cambios pequenos', () => {
        const fakeEvent = {
            contentChanges: [
                {
                    text: 'hola',
                    rangeLength: 0
                }
            ]
        } as any;

        const result = detectAiCodeInsertion(fakeEvent);
        assert.strictEqual(result, undefined);
    });
});
