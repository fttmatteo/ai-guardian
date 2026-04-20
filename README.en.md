# 🛡️ AI Guardian

*[Leer en Español](README.md)*

<p align="center">
  <img src="docs/logo.png" width="200" alt="AI Guardian Logo">
</p>

<p align="center">
  <strong>Intelligent and preventive security for your AI-assisted code.</strong><br>
  <em>Protect your workflow by detecting OWASP risks in real-time.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.4.6-blue.svg" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Security-OWASP-red" alt="Security Focused">
  <img src="https://img.shields.io/badge/Mode-Proactive-orange" alt="Proactive Auditing">
</p>

## What is AI Guardian?

AI Guardian is a VS Code extension designed to audit your code's security, especially that generated or assisted by Artificial Intelligence. It combines ultra-fast local static analysis with the semantic power of advanced LLM models under a BYOK (Bring Your Own Key) model.

### Features

- **Industrial Auditing (OWASP)**: Detects SQL Injections, Path Traversal, SSRF, and Weak Cryptography aligned with OWASP Top 10 standards.
- **Auto-Correction (Quick Fixes)**: We don't just detect, we fix! Click the yellow lightbulb (`Ctrl + .`) over a vulnerability and the AI will surgically inject the secure code to solve it instantly without breaking the rest of your file. *(💡 **Pro Tip:** If your document has multiple vulnerabilities, fix one using Quick Fix and hit `Ctrl + S` to save. This forces the Guardian to immediately recalculate perfect text coordinates for your next corrections).*
- **Total Proactivity**: The Guardian automatically scans upon opening files, saving, or detecting code insertions. You don't have to configure anything.
- **Ultra-Lightweight & Optimized**: Built with high-performance engineering standards. Readings are asynchronous and internal memory management guarantees that VS Code never freezes, even on monstrous files or giant projects.
- **Multilingual Support**: Native protection for **Java, Python, JavaScript, TypeScript, and React**.
- **Intelligent Hybrid Auditing**: Combines the speed of local rules with the semantic depth of LLMs under the **BYOK (Bring Your Own Key)** model.
- **Guaranteed Privacy**: Your API Keys are securely stored in your Operating System's internal vault (Credential Manager/Keychain) safely unexposed. Your data only travels to the provider you choose via end-to-end encryption (Gemini, OpenAI, or Claude).

## Quick Start in 3 Steps

### 1. Installation

Search for **"AI Guardian"** in the VS Code Marketplace and install it.

### 2. Configuration (Optional but Recommended)

To activate the power of AI and semantic audits:
1. Open the command palette (`Ctrl+Shift+P`).
2. Run: `AI Guardian: Configurar BYOK (Proveedor/API Key)`.
3. Enter your Gemini, OpenAI, or Claude API Key.

### 3. Get to work!

- **Automatic Mode:** When opening or saving files, the Guardian uses its fast **local rules engines (Offline)** to immediately detect leaks without spending your API Key quota. It only automatically resorts to the Artificial Intelligence (LLM) engine if it detects that you have *pasted or injected* a considerable block of code (≥ 5 lines).
- **Deep AI Mode:** If you want to force the Artificial Intelligence to scan your entire file from top to bottom regardless of its size to get mathematical and semantic curations, execute the command: `AI Guardian: Analizar archivo actual`.

## Customization

You can adjust your security level in the VS Code **Settings**:
- **Shadow Mode**: If active, only critical alerts will interrupt with popups; the rest remain silent in the problems list.
- **AI Profiles**: Select between `free`, `balanced`, or `deep` to balance the cost and quality of the analysis.

## Contributions and Security

Do you want to improve the Guardian or found something? 
- Review our [Contribution Guide](CONTRIBUTING.en.md).
- Read our [Security Policy](SECURITY.en.md).

<details>
<summary>🛠️ <b>Developer Section</b> (Click to expand)</summary>

### Compilation and Development

If you want to clone this repo and work on it:
1. `npm install` - Install dependencies.
2. `npm run watch` - Real-time compilation.
3. `F5` - Launches a VS Code instance with the extension loaded.

### Project Structure

- `src/core/`: Detection engines, asynchronous services, and memory management.
- `src/auditors/`: Local analysis logic (Cached RegEx) and LLM engine.
- `src/config/`: Default rules and configuration.
- `src/providers/`: Visual integration engines (Diagnostics and Quick Fix Actions via `WeakMap`).

### Performance Architecture (Devs)

AI Guardian is designed to never block the Extension Host's Main Thread:
- Uses **delegated asynchronous reads (`fs.promises`)** for Workspace context determination.
- Applies **WeakMaps** to link solutions to visual diagnostics, forcing temporary memory release (Garbage Collection) when closing files and preventing OOM memory leaks.
- Regular expressions are **pre-compiled only once**; the inserted block count uses atomic `match()` evaluation to avoid recreating massive buffers.

### Adding Custom Local Rules

If you want the Guardian to detect vulnerabilities specific to your enterprise security team, create a `rules.json` file directly at the root of your project Workspace.

The file format must be an Array of Rules (`Array<Rule>`), for example:
```json
[
  {
    "id": "no-hardcoded-passwords",
    "language": "any", 
    "pattern": "(password|clave|secret)\\s*=\\s*['\\\"][a-zA-Z0-9]+['\\\"]",
    "message": "Detected possible credential hardcoding in source code.",
    "severity": "HIGH"
  }
]
```
**Required Parameters:**
- `id`: A unique name that identifies your custom rule.
- `language`: The language to inspect (e.g., `java`, `python`, `javascriptreact`, or `any` to audit all).
- `pattern`: The robust Regular Expression (Regex) to capture the exact error text.
- `message`: The alert developers will see when the rule is broken.
- `severity`: Error gravity status: `CRITICAL`, `HIGH`, `MEDIUM` or `LOW`.

### Running Tests

To ensure the Guardian's stability:
- `npm run test:unit` - Runs unit tests for core logic.
- `npm run test` - Launches integration tests in a VS Code instance.
</details>

## Credits and License

Created and maintained by **[Mateo Valencia Ardila](https://github.com/fttmatteo)**.

This software operates under the **MIT License**. You are free to distribute, edit or use this architectural base even for commercial development under the mandatory condition of explicitly preserving the copyright paragraphs and acknowledgement to Mateo Valencia as the master creator. (Read the `LICENSE` document for more legal instructions).
