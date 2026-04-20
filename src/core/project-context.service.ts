import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

export type ProjectContext = 'SpringBoot' | 'React' | 'Java' | 'Python' | 'Unknown';

export class ProjectContextService {
    private context: ProjectContext = 'Unknown';

    constructor() {
        void this.refreshContext();
    }

    public async refreshContext(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            this.context = 'Unknown';
            return;
        }
        const workspaceRoot = workspaceFolders[0].uri.fsPath;

        const pomPath = path.join(workspaceRoot, 'pom.xml');
        if (fs.existsSync(pomPath)) {
            try {
                const content = await fs.promises.readFile(pomPath, 'utf-8');
                if (content.includes('spring-boot-starter')) {
                    this.context = 'SpringBoot';
                    Logger.log('Contexto Spring Boot detectado.');
                    return;
                }
            } catch (e) {
                Logger.error('Error asincrónico leyendo pom.xml', e);
            }

            this.context = 'Java';
            Logger.log('Contexto Java detectado desde pom.xml.');
            return;
        }

        const packageJsonPath = path.join(workspaceRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            try {
                const content = await fs.promises.readFile(packageJsonPath, 'utf-8');
                if (content.includes('"react"')) {
                    this.context = 'React';
                    Logger.log('Contexto React detectado.');
                    return;
                }
            } catch (e) {
                Logger.error('Error asincrónico leyendo package.json', e);
            }
        }
        
        const pythonFiles = ['requirements.txt', 'pyproject.toml', 'setup.py', 'environment.yml'];
        for (const file of pythonFiles) {
            const filePath = path.join(workspaceRoot, file);
            if (fs.existsSync(filePath)) {
                this.context = 'Python';
                Logger.log(`Contexto Python detectado desde ${file}.`);
                return;
            }
        }
        
        this.context = 'Unknown';
    }

    public getContext(): ProjectContext {
        return this.context;
    }

    public getEffectiveContext(languageId: string): ProjectContext {
        if (this.context !== 'Unknown') {
            return this.context;
        }

        if (languageId === 'java') {
            return 'Java';
        }

        if (languageId === 'javascriptreact' || languageId === 'typescriptreact') {
            return 'React';
        }

        if (languageId === 'python') {
            return 'Python';
        }

        return 'Unknown';
    }
}
