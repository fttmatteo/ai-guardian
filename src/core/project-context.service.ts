import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { Logger } from './logger';

export type ProjectContext = 'SpringBoot' | 'React' | 'Java' | 'Unknown';

export class ProjectContextService {
    private context: ProjectContext = 'Unknown';

    constructor() {
        this.refreshContext();
    }

    public refreshContext() {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            this.context = 'Unknown';
            return;
        }
        const workspaceRoot = workspaceFolders[0].uri.fsPath;

        const pomPath = path.join(workspaceRoot, 'pom.xml');
        if (fs.existsSync(pomPath)) {
            const content = fs.readFileSync(pomPath, 'utf-8');
            if (content.includes('spring-boot-starter')) {
                this.context = 'SpringBoot';
                Logger.log('Contexto Spring Boot detectado.');
                return;
            }

            this.context = 'Java';
            Logger.log('Contexto Java detectado desde pom.xml.');
            return;
        }

        const packageJsonPath = path.join(workspaceRoot, 'package.json');
        if (fs.existsSync(packageJsonPath)) {
            const content = fs.readFileSync(packageJsonPath, 'utf-8');
            if (content.includes('"react"')) {
                this.context = 'React';
                Logger.log('Contexto React detectado.');
                return;
            }
        }
        
        // El contexto desconocido es normal en archivos sueltos o carpetas sin config estandar.
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

        return 'Unknown';
    }
}
