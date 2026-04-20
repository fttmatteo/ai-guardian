# Contribution Guide for AI Guardian

_[Read in Spanish](CONTRIBUTING.md)_

Thank you for showing interest in developing and improving **AI Guardian**! As an open-source project, we depend on brilliant and analytical minds to strengthen the architecture that protects us all.

## Development Environment

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [VS Code](https://code.visualstudio.com/)
- [Git](https://git-scm.com/)

### Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/fttmatteo/ai-guardian.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Compile the extension**:
   ```bash
   npm run compile
   ```
4. **Open in VS Code**:
   ```bash
   code .
   ```
5. **Launch**:
   Press `F5` to open a new VS Code window with the extension loaded.

## Testing

AI Guardian emphasizes reliability. Please ensure your changes pass all tests before submitting a PR.

- **Run all tests**:
  ```bash
  npm test
  ```
- **Run unit tests only**:
  ```bash
  npm run test:unit
  ```

## Coding Standards and Performance

- Use **TypeScript** for all extension logic.
- Follow the existing formatting (ESLint is configured).
- Write descriptive commit messages following [Conventional Commits](https://www.conventionalcommits.org/).
- **Performance:** Avoid using synchronous file system APIs completely (`fs.readFileSync`). Always use asynchronous wrappers (`fs.promises`) to avoid freezing the VS Code UI. Regular expressions must be pre-compiled and cached.
- Ensure new features have corresponding unit or integration tests.

## Pull Request Process

1. **Create a branch**: `feat/your-feature` or `fix/your-fix`.
2. **Commit changes**: Ensure tests pass locally.
3. **Draft a PR**: Describe the changes, the "Why", and any breaking changes.
4. **Review**: Wait for maintainer feedback.

## Fork

To start, make a Fork, open your branch (`git checkout -b feature/MyAmazingInvention`), inject your code, and upload your history (`git commit -m 'I did this crazy thing'`). We are looking forward to it!

## Checklist

- [ ] My code follows the style guidelines of this project.
- [ ] I have performed a self-review of my own code.
- [ ] I have commented my code, particularly in hard-to-understand areas.
- [ ] I have made corresponding changes to the documentation.
- [ ] My changes generate no new warnings.
- [ ] I have added tests that prove my fix is effective or that my feature works.

## License

By contributing, you agree that your contributions will be licensed under the project's **MIT License**.
