import * as path from 'path';
import Mocha from 'mocha';
import * as fs from 'fs';

function collectTestFiles(dir: string): string[] {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const files: string[] = [];

    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            files.push(...collectTestFiles(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.test.js')) {
            files.push(fullPath);
        }
    }

    return files;
}

export function run(): Promise<void> {
    const mocha = new Mocha({
        ui: 'tdd',
        color: true
    });

    const testsRoot = path.resolve(__dirname);
    const files = collectTestFiles(testsRoot);

    return new Promise((resolve, reject) => {
        for (const file of files) {
            mocha.addFile(file);
        }

        try {
            mocha.run((failures: number) => {
                if (failures > 0) {
                    reject(new Error(`${failures} tests failed.`));
                } else {
                    resolve();
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}
