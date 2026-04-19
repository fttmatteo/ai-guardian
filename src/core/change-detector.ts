import * as vscode from 'vscode';

const MIN_LINE_COUNT_FOR_IA = 5;
const MIN_CHAR_COUNT_FOR_IA = 200;

export function detectAiCodeInsertion(event: vscode.TextDocumentChangeEvent): string | undefined {
  for (const change of event.contentChanges) {
    const addedLines = change.text.split('\n');
    const numberOfAddedLines = addedLines.length - 1;

    if (numberOfAddedLines >= MIN_LINE_COUNT_FOR_IA && change.text.length >= MIN_CHAR_COUNT_FOR_IA) {
      return change.text;
    }
  }

  return undefined;
}
