const fs = require('fs');

async function main() {
  const response = await fetch('https://openrouter.ai/api/v1/models');
  const payload = await response.json();
  const allModels = payload.data.map(m => m.id);

  const openAiModels = allModels.filter(id => id.startsWith('openai/')).map(id => id.replace('openai/', ''));
  const claudeModels = allModels.filter(id => id.startsWith('anthropic/')).map(id => id.replace('anthropic/', ''));
  const geminiModels = allModels.filter(id => id.startsWith('google/')).map(id => id.replace('google/', ''));
  const openRouterModels = allModels.filter(id => !id.startsWith('openai/') && !id.startsWith('anthropic/') && !id.startsWith('google/'));

  const catalog = {
    gemini: {
      free: geminiModels.filter(id => id.includes('flash') || id.includes('lite')),
      balanced: geminiModels.filter(id => !id.includes('exp') && !id.includes('ultra')),
      deep: geminiModels
    },
    openai: {
      free: openAiModels.filter(id => id.includes('mini') || id.includes('3.5')),
      balanced: openAiModels.filter(id => id.includes('gpt-4')),
      deep: openAiModels
    },
    claude: {
      free: claudeModels.filter(id => id.includes('haiku')),
      balanced: claudeModels.filter(id => id.includes('sonnet')),
      deep: claudeModels
    },
    openrouter: {
      free: openRouterModels.filter(id => id.includes('free') || id.includes('8b') || id.includes('7b')),
      balanced: openRouterModels.filter(id => id.includes('70b') || id.includes('mixtral')),
      deep: openRouterModels
    }
  };

  for (const provider of Object.keys(catalog)) {
    for (const profile of ['free', 'balanced', 'deep']) {
      if (catalog[provider][profile].length === 0) {
        catalog[provider][profile] = catalog[provider]['deep'].length > 0 ? catalog[provider]['deep'] : ['default'];
      }
    }
  }

  fs.writeFileSync('src/config/model-catalog.json', JSON.stringify(catalog, null, 2));
  fs.writeFileSync('src/config/model-replacement-preferences.json', JSON.stringify(catalog, null, 2));
  console.log("Catálogo generado con todos los modelos disponibles.");
}

main();
