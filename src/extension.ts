import * as path from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(
        vscode.commands.registerCommand('ask-me.start', () => {
            WebViewPanel.createOrShow(context.extensionPath, 'Auto');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ask-me.python', () => {
            WebViewPanel.createOrShow(context.extensionPath, 'Python');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ask-me.javascript', () => {
            WebViewPanel.createOrShow(context.extensionPath, 'Javascript');
        })
    );

    context.subscriptions.push(
        vscode.commands.registerCommand('ask-me.doRefactor', () => {
            if (WebViewPanel.currentPanel) {
                WebViewPanel.currentPanel.doRefactor();
            }
        })
    );

    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serializer in activation event
        vscode.window.registerWebviewPanelSerializer(WebViewPanel.viewType, {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                console.log(`Got state: ${state}`);
                WebViewPanel.revive(webviewPanel, context.extensionPath);
            }
        });
    }
}

/**
 * Manages cat coding webview panels
 */
class WebViewPanel {
    /**
     * Track the currently panel. Only allow a single panel to exist at a time.
     */
    public static currentPanel: WebViewPanel | undefined;

    public static readonly viewType = 'ask-me';

    private readonly _panel: vscode.WebviewPanel;
    private readonly _extensionPath: string;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionPath: string, language: string) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        let detectedLanguage: string = language;
        if (language === 'auto' && vscode.window.activeTextEditor) {
            detectedLanguage = vscode.window.activeTextEditor.document.languageId;
        }

        if (detectedLanguage === 'auto') {
            vscode.window.showErrorMessage('Language not found');
            return;
        }

        if (WebViewPanel.currentPanel) {
            WebViewPanel.currentPanel._panel.reveal(column);
            return;
        }

        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            WebViewPanel.viewType,
            `Ask me: ${language}`,
            column || vscode.ViewColumn.One,
            {
                // Enable javascript in the webview
                enableScripts: true,

                // And restrict the webview to only loading content from our extension's `media` directory.
                localResourceRoots: [vscode.Uri.file(path.join(extensionPath, 'media'))]
            }
        );

        WebViewPanel.currentPanel = new WebViewPanel(panel, extensionPath);
    }

    public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
        WebViewPanel.currentPanel = new WebViewPanel(panel, extensionPath);
    }

    private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
        this._panel = panel;
        this._extensionPath = extensionPath;

        // Set the webview's initial html content
        this._panel.webview.html = this._getHtmlForWebview();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            message => {
                switch (message.command) {
                    case 'alert':
                        vscode.window.showErrorMessage(message.text);
                        return;
                    case 'question-asked':
                        console.log(`question-asked ${message.text}`);
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    public doRefactor() {
        // Send a message to the webview webview.
        // You can send any JSON serializable data.
        this._panel.webview.postMessage({ command: 'refactor' });
    }

    public dispose() {
        WebViewPanel.currentPanel = undefined;

        // Clean up our resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }

    private _getHtmlForWebview() {
        // Local path to main script run in the webview
        const scriptPathOnDisk = vscode.Uri.file(
            path.join(this._extensionPath, 'media', 'main.js')
        );
        const scriptUri = this._panel.webview.asWebviewUri(scriptPathOnDisk);

        // Local path to main style sfile
        const stylesPathOnDisk = vscode.Uri.file(
            path.join(this._extensionPath, 'media', 'main.css')
        );
        const stylesUri = this._panel.webview.asWebviewUri(stylesPathOnDisk);

        // Use a nonce to whitelist which scripts can be run
        const nonce = getNonce();

        console.log(`Styles URI: ${stylesUri}. Nonce: ${nonce}. Script URI: ${scriptUri}`);

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <!--
                Use a content security policy to only allow loading images from https or from our extension directory,
                and only allow scripts that have a specific nonce.
                <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${this._panel.webview.cspSource} https:; script-src 'nonce-${nonce}';">
                -->
                <link rel="stylesheet" type="text/css" href="${stylesUri}">
                <script src="${scriptUri}"></script>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Ask me</title>
            </head>
            <body>
                <h1>Welcome to Ask me</h1>
                <h4>Type a question:</h4>
                <div class="container">
                    <div id="chat"></div>
                    <div class="wrapper">
                        <input id="question" type="text">
                        <button type="button" onclick="send()">Send</button>
                    </div>
                </div>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}