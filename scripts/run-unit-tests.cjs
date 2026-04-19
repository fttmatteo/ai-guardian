const path = require('path');
const Mocha = require('mocha');

async function main() {
  const mocha = new Mocha({
    ui: 'tdd',
    color: true
  });

  const files = [
    path.resolve(__dirname, '../out/test/suite/change-detector.test.js'),
    path.resolve(__dirname, '../out/test/suite/llm-usage-guard.test.js')
  ];

  for (const file of files) {
    mocha.addFile(file);
  }

  await new Promise((resolve, reject) => {
    mocha.run((failures) => {
      if (failures > 0) {
        reject(new Error(`${failures} tests failed.`));
      } else {
        resolve();
      }
    });
  });
}

main().catch((error) => {
  console.error('Error al ejecutar test:unit', error);
  process.exit(1);
});
