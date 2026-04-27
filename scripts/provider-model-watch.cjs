const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CATALOG_PATH = path.join(ROOT, 'src', 'config', 'model-catalog.json');
const PREFERENCES_PATH = path.join(ROOT, 'src', 'config', 'model-replacement-preferences.json');
const REPORT_PATH = path.join(ROOT, 'model-watch-report.json');

function readCatalog() {
  return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
}

function writeCatalog(catalog) {
  fs.writeFileSync(CATALOG_PATH, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
}

function readReplacementPreferences() {
  return JSON.parse(fs.readFileSync(PREFERENCES_PATH, 'utf8'));
}

function writeReplacementPreferences(preferences) {
  fs.writeFileSync(PREFERENCES_PATH, `${JSON.stringify(preferences, null, 2)}\n`, 'utf8');
}

async function fetchOpenRouterModels() {
  const response = await fetch('https://openrouter.ai/api/v1/models');
  
  if (!response.ok) {
    throw new Error(`Error de API de modelos de OpenRouter: ${response.status} ${await response.text()}`);
  }

  const payload = await response.json();
  const allModels = (payload.data ?? []).map(item => item.id).filter(Boolean);

  const openAiModels = allModels
    .filter(id => id.startsWith('openai/'))
    .map(id => id.replace('openai/', ''));

  const claudeModels = allModels
    .filter(id => id.startsWith('anthropic/'))
    .map(id => id.replace('anthropic/', ''));

  const geminiModels = allModels
    .filter(id => id.startsWith('google/'))
    .map(id => id.replace('google/', ''));

  return { openAiModels, claudeModels, geminiModels, allModels };
}

function chooseReplacement(provider, profile, availableModels, replacementPreferences) {
  if (availableModels.length === 0) {
    return undefined;
  }

  const preferred = replacementPreferences?.[provider]?.[profile] ?? [];
  for (const candidate of preferred) {
    if (availableModels.includes(candidate)) {
      return candidate;
    }
  }

  if (provider === 'openai') {
    return availableModels.find(model => model.startsWith('gpt-') || model.startsWith('o'));
  }

  if (provider === 'gemini') {
    return availableModels.find(model => model.includes('gemini'));
  }

  return availableModels[0];
}

function syncCatalog(catalog, providerModels, replacementPreferences) {
  const updated = JSON.parse(JSON.stringify(catalog));
  const changes = [];

  for (const provider of Object.keys(updated)) {
    const available = providerModels[provider] ?? [];
    if (available.length === 0) {
      continue;
    }

    for (const profile of Object.keys(updated[provider])) {
      const modelList = updated[provider][profile];
      for (let i = 0; i < modelList.length; i += 1) {
        const modelName = modelList[i];
        if (available.includes(modelName)) {
          continue;
        }

        const replacement = chooseReplacement(provider, profile, available, replacementPreferences);
        if (!replacement) {
          continue;
        }

        changes.push({ provider, profile, from: modelName, to: replacement });
        modelList[i] = replacement;
      }
    }
  }

  return { updated, changes };
}

function validateCatalog(catalog, providerModels) {
  const missing = [];

  for (const provider of Object.keys(catalog)) {
    const available = providerModels[provider] ?? [];
    if (available.length === 0) {
      continue;
    }

    for (const profile of Object.keys(catalog[provider])) {
      for (const model of catalog[provider][profile]) {
        if (!available.includes(model)) {
          missing.push({ provider, profile, model });
        }
      }
    }
  }

  return missing;
}

function pruneReplacementPreferences(replacementPreferences, providerModels) {
  const updated = JSON.parse(JSON.stringify(replacementPreferences));
  const pruned = [];
  const ambiguities = [];

  for (const provider of Object.keys(updated)) {
    const available = providerModels[provider] ?? [];
    if (available.length === 0) {
      ambiguities.push({
        provider,
        profile: 'all',
        reason: 'El proveedor no devolvio modelos disponibles.'
      });
      continue;
    }

    for (const profile of Object.keys(updated[provider])) {
      const original = Array.isArray(updated[provider][profile]) ? updated[provider][profile] : [];
      const valid = [];

      for (const model of original) {
        if (available.includes(model)) {
          valid.push(model);
        } else {
          pruned.push({ provider, profile, model });
        }
      }

      const uniqueValid = [...new Set(valid)];
      updated[provider][profile] = uniqueValid;

      if (uniqueValid.length === 0) {
        ambiguities.push({
          provider,
          profile,
          reason: 'No quedaron modelos preferidos validos tras la poda.'
        });
      }
    }
  }

  return { updated, pruned, ambiguities };
}

async function main() {
  const sync = process.argv.includes('--sync');
  const syncPreferences = process.argv.includes('--sync-preferences') || sync;
  const failOnMissing = process.argv.includes('--fail-on-missing');
  const failOnAmbiguous = process.argv.includes('--fail-on-ambiguous');

  const catalog = readCatalog();
  const replacementPreferences = readReplacementPreferences();
  
  console.log("Obteniendo modelos desde la API pública de OpenRouter...");
  const { openAiModels, claudeModels, geminiModels, allModels } = await fetchOpenRouterModels();

  const providerModels = {
    openai: openAiModels,
    gemini: geminiModels,
    claude: claudeModels,
    openrouter: allModels
  };

  const report = {
    generatedAt: new Date().toISOString(),
    counts: {
      openai: openAiModels.length,
      gemini: geminiModels.length,
      claude: claudeModels.length,
      openrouter: allModels.length
    },
    missingModels: validateCatalog(catalog, providerModels),
    preferencePruned: [],
    preferenceAmbiguities: []
  };

  const preferencesResult = pruneReplacementPreferences(replacementPreferences, providerModels);
  report.preferencePruned = preferencesResult.pruned;
  report.preferenceAmbiguities = preferencesResult.ambiguities;

  if (syncPreferences && preferencesResult.pruned.length > 0) {
    writeReplacementPreferences(preferencesResult.updated);
    console.log('Preferencias de reemplazo podadas automaticamente.');
    for (const change of preferencesResult.pruned) {
      console.log(`- ${change.provider}/${change.profile}: se elimino ${change.model}`);
    }
  }

  if (sync) {
    const result = syncCatalog(catalog, providerModels, preferencesResult.updated);
    if (result.changes.length > 0) {
      writeCatalog(result.updated);
      report.syncedChanges = result.changes;
      report.missingModels = validateCatalog(result.updated, providerModels);
      console.log('Catalogo de modelos sincronizado con proveedores.');
      for (const change of result.changes) {
        console.log(`- ${change.provider}/${change.profile}: ${change.from} -> ${change.to}`);
      }
    } else {
      console.log('No hubo cambios necesarios en catalogo de modelos.');
    }
  }

  fs.writeFileSync(REPORT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Reporte generado en: ${REPORT_PATH}`);
  console.log(`Modelos detectados: OpenAI=${report.counts.openai}, Gemini=${report.counts.gemini}, Claude=${report.counts.claude}, OpenRouter=${report.counts.openrouter}`);

  if (failOnMissing && report.missingModels.length > 0) {
    console.error('Modelos faltantes detectados en catalogo local:');
    for (const item of report.missingModels) {
      console.error(`- ${item.provider}/${item.profile}: ${item.model}`);
    }
    process.exit(1);
  }

  if (failOnAmbiguous && report.preferenceAmbiguities.length > 0) {
    console.error('Ambiguedades detectadas en preferencias de reemplazo:');
    for (const item of report.preferenceAmbiguities) {
      console.error(`- ${item.provider}/${item.profile}: ${item.reason}`);
    }
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Error en provider-model-watch:', error);
  process.exit(1);
});
