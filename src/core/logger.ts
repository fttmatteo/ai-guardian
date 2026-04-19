import * as vscode from 'vscode';

export class Logger {
    private static outputChannel: vscode.OutputChannel;

    public static initialize(channelName: string) {
        if (!Logger.outputChannel) {
            Logger.outputChannel = vscode.window.createOutputChannel(channelName);
        }
    }

    public static log(message: string) {
        if (Logger.outputChannel) {
            const timestamp = new Date().toLocaleTimeString();
            Logger.outputChannel.appendLine(`[INFO ${timestamp}] ${message}`);
            Logger.outputChannel.show(true);
        }
    }

    public static warn(message: string) {
        if (Logger.outputChannel) {
            const timestamp = new Date().toLocaleTimeString();
            Logger.outputChannel.appendLine(`[ADVERTENCIA ${timestamp}] ${message}`);
        }
    }

    public static error(message: string, error?: any) {
        if (Logger.outputChannel) {
            const timestamp = new Date().toLocaleTimeString();
            Logger.outputChannel.appendLine(`[ERROR ${timestamp}] ${message}`);
            if (error) {
                console.error(message, error);
                Logger.outputChannel.appendLine(error.stack || error.toString());
            }
        }
    }
}
