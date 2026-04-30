# 🛡️ AI Guardian

*[Leer en Español](README.md)*

<p align="center">
  <img src="docs/logo.png" width="180" alt="AI Guardian Logo">
</p>

<p align="center">
  <strong>The ultimate shield for your AI-assisted code.</strong><br>
  <em>Don't let the speed of AI compromise your production security.</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-1.7.1-blue.svg?style=flat-square" alt="Version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg?style=flat-square" alt="License">
  <img src="https://img.shields.io/badge/Security-OWASP_Top_10-red?style=flat-square" alt="OWASP">
  <img src="https://img.shields.io/badge/Mode-Smart_Hybrid-orange?style=flat-square" alt="Hybrid">
</p>

---

## Why AI Guardian?

In the era of AI-assisted development, code is generated faster than ever, but it also introduces hidden risks. **AI Guardian** is your last line of defense.

Unlike traditional linters, we combine **ultra-fast local analysis** with the **semantic depth of the world's most powerful LLMs**, ensuring every line of code is secure, private, and professional.

### Key Features

- **🛡️ Industrial Auditing (OWASP)**: Total shield against SQL Injection, Path Traversal, SSRF, and Weak Cryptography. Aligned with international **OWASP Top 10** standards.
- **⚡ Surgical Auto-Correction (Quick Fixes)**: Found a risk? Fix it instantly. With `Ctrl + .` (Quick Fix), our AI injects the exact security patch, respecting your code style without breaking the rest of your file.
- **🤖 Smart Hybrid Intelligence (BYOK)**: You are in control. Use your own API Keys (**Gemini, OpenAI, Claude, or OpenRouter**) for deep analysis, while our local rules work in the background at no cost.
- **🔒 Bank-Grade Privacy**: Your API Keys never leave your machine; they are stored in your **Operating System's secure vault** (Keychain/Credential Manager). Your data only travels to the provider you choose via encrypted channels.
- **🚀 Extreme Performance**: Built to stay out of your way. Asynchronous auditing, smart memory management, and zero-lag performance, even in large-scale projects.

---

## Quick Start

### 1. Installation
Search for **"AI Guardian"** in the VS Code Marketplace and install it with one click.

### 2. Configuration (Recommended)
To unlock the full power of semantic detection:
1. `Ctrl + Shift + P` -> `AI Guardian: Configurar BYOK`.
2. Choose your favorite provider and enter your API Key.
3. *Done! You now have a security expert auditing your code in real-time.*

### 3. Usage Modes
- **Proactive Mode (Automatic):** The Guardian watches your code insertions. If it detects a new block (≥ 5 lines), it will automatically trigger AI analysis if BYOK is configured.
- **Local Auditing (Always On):** Instant analysis based on local rules that doesn't consume quota or require internet.
- **Deep Manual Scan:** Run `AI Guardian: Analizar archivo actual` for a complete and exhaustive report of your entire document.

---

## Customization
Tailor the experience to your workflow in VS Code settings:
- **Shadow Mode**: Stay focused. Only high-risk alerts will interrupt with popups; the rest will appear discreetly in your problems panel.
- **Usage Profiles**: Select between `free`, `balanced`, or `deep` to optimize your quota consumption based on desired depth.

---

## Contributions and Security
Want to help make the world's code safer?
- Review our [Contribution Guide](CONTRIBUTING.en.md).
- Read our [Security Policy](SECURITY.en.md).

---

<details>
<summary><b>Developer Section</b> (Click to expand)</summary>

### Compilation and Development

If you want to clone this repo and work on it:
1. `npm install` - Install dependencies.
2. `npm run watch` - Real-time compilation.
3. `F5` - Launches a VS Code instance with the extension loaded.

### Project Structure

- `src/core/`: Detection engines, project context, and asynchronous memory management.
- `src/auditors/`: Local analysis logic (Cached RegEx) and LLM engine (BYOK).
- `src/config/`: Default security rules and configuration.
- `src/providers/`: Visual integration (Diagnostics and Quick Fix Actions via `WeakMap`).

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

To ensure the stability of the Guardian:
- `npm run test:unit` - Compiles and runs unit tests for the core logic.
- `npm run test` - Launches integration tests in a clean VS Code instance.
</details>

## Credits and License

Created and maintained by **[Mateo Valencia Ardila](https://github.com/fttmatteo)**.

This software operates under the **MIT License**. You are free to distribute, edit, or use this architectural base even for commercial development, provided that you explicitly preserve the copyright and acknowledgment to Mateo Valencia as the original creator. (See the `LICENSE` document for full legal details).
