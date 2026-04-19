# Security Policy

*[Read in Spanish](SECURITY.md)*

## Supported Versions

I will provide security updates for the following versions:

| Version | Actively Supported? |
| ------- | ------------------ |
| v1.3.x   | :white_check_mark: |
| Old     | :x:                |

## BYOK Best Practices

Since AI Guardian operates on a **Bring Your Own Key** model, users are responsible for their API Keys.

1. **Secure Storage**: AI Guardian uses VS Code's `SecretStorage` to encrypt and store your keys. Never share your `.vscode` settings with API keys inside.
2. **Key Rotation**: We recommend rotating your API keys periodically.
3. **Usage Limits**: Always set budget alerts on your provider dashboard (Google AI Studio, OpenAI, Anthropic).

## Reporting a Vulnerability

If you discover a security vulnerability, please do NOT open a public issue. Follow these steps:

1. Send a private email or direct message to the project packager (**Mateo Valencia Ardila**) with the subject `AI GUARDIAN VULNERABILITY`.
2. Provide a PoC (Proof of Concept) or reproducible injection code.
3. We will try to mitigate the breach by publishing a security "Hotfix" within the weekly cycle following the formal reading of the report. We immensely appreciate those who detect lethal errors with the aim of helping.

## Disclosure

We follow responsible disclosure practices. We will not disclose the vulnerability until a fix is available and users have had time to update, unless it's in the best interest of the community.
