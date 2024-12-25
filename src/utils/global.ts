import path from 'node:path';
import * as vscode from 'vscode';

export function newTerminal(command: string, projectCurrent: string) {
  const basename = path.basename(projectCurrent);
  const terminalName = `vona-cli:${basename}`;
  const existingTerminal = vscode.window.terminals.find(
    (terminal) => terminal.name === terminalName
  );
  if (existingTerminal) {
    existingTerminal.show();
    existingTerminal.sendText(command);
  } else {
    const terminal = vscode.window.createTerminal({
      name: terminalName,
      cwd: projectCurrent,
    });
    terminal.sendText(command);
    terminal.show();
  }
}

export async function showTextDocument(pathResource: string) {
  const doc = await vscode.workspace.openTextDocument(
    vscode.Uri.file(pathResource)
  );
  vscode.window.showTextDocument(doc);
}
