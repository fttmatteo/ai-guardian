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
- **Total Proactivity**: The Guardian automatically scans upon opening files, saving, or detecting code insertions. You don't have to configure anything.
- **Multilingual Support**: Native protection for **Java, Python, JavaScript, TypeScript, and React**.
- **Intelligent Hybrid Auditing**: Combines the speed of local rules with the semantic depth of LLMs under the **BYOK (Bring Your Own Key)** model.
- **Guaranteed Privacy**: Your API Keys are securely stored on your system, and your data only travels to the provider you choose (Gemini, OpenAI, or Claude).

## Quick Start in 3 Steps

### 1. Installation
Search for **"AI Guardian"** in the VS Code Marketplace and install it.

### 2. Configuration (Optional but Recommended)
To activate the power of AI and semantic audits:
1. Open the command palette (`Ctrl+Shift+P`).
2. Run: `AI Guardian: Configurar BYOK (Proveedor/API Key)`.
3. Enter your Gemini, OpenAI, or Claude API Key.

### 3. Get to work!
Just open your code files. If a detected risk exists, you'll see color-coded underlines and an instant notification. You can also force a scan with: `AI Guardian: Analizar archivo actual`.

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
- `src/core/`: Detection engines and base services.
- `src/auditors/`: Local and LLM analysis logic.
- `src/config/`: Default rules and configuration.

### Adding Local Rules
You can extend security by adding a `rules.json` file at the root of your project with the `Rule` object format.

### Running Tests
To ensure the Guardian's stability:
- `npm run test:unit` - Runs unit tests for core logic.
- `npm run test` - Launches integration tests in a VS Code instance.
</details>

## Credits and License

Created and maintained by **[Mateo Valencia Ardila](https://github.com/fttmatteo)**.

This software operates under the **MIT License**. You are free to distribute, edit or use this architectural base even for commercial development under the mandatory condition of explicitly preserving the copyright paragraphs and acknowledgement to Mateo Valencia as the master creator. (Read the `LICENSE` document for more legal instructions).
