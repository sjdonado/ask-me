import * as path from "path";
import * as vscode from "vscode";
import axios, { AxiosResponse } from "axios";
import { print } from "graphql";

import view from "./view";

import { GET_QUESTION } from "./queries";
import { Message, Question, Response } from "./types";
import { API_URL } from './config';
import { evaluate } from "./services/mathjs";
  
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("ask-me.start", () => {
      WebViewPanel.createOrShow(context.extensionPath, "Auto");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ask-me.python", () => {
      WebViewPanel.createOrShow(context.extensionPath, "Python");
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("ask-me.javascript", () => {
      WebViewPanel.createOrShow(context.extensionPath, "Javascript");
    })
  );
}

class WebViewPanel {
  public static currentPanel: WebViewPanel | undefined;

  public static readonly viewType = "ask-me";

  private readonly _panel: vscode.WebviewPanel;
  private readonly _extensionPath: string;
  private _disposables: vscode.Disposable[] = [];

  public static createOrShow(extensionPath: string, language: string) {
    const column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;

    let detectedLanguage: string = language;
    if (language === "Auto" && vscode.window.activeTextEditor) {
      detectedLanguage = vscode.window.activeTextEditor.document.languageId;
    }

    if (detectedLanguage === "Auto") {
      vscode.window.showErrorMessage("Language not found");
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
      column || vscode.ViewColumn.Two,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [
          vscode.Uri.file(path.join(extensionPath, "media")),
        ],
      }
    );

    WebViewPanel.currentPanel = new WebViewPanel(panel, extensionPath);
  }

  public static revive(panel: vscode.WebviewPanel, extensionPath: string) {
    WebViewPanel.currentPanel = new WebViewPanel(panel, extensionPath);
  }

  private constructor(panel: vscode.WebviewPanel, extensionPath: string) {
    const messages: Message[] = [];
    this._panel = panel;
    this._extensionPath = extensionPath;

    // Set the webview's initial html content
    this._panel.webview.html = this._getHtmlForWebview(messages);

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    const newMessage = (type: string, text: string) => {
        messages.push({ type, text, time: new Date().toLocaleTimeString() });
    };

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      async (message) => {
        switch (message.command) {
          case "alert":
            vscode.window.showErrorMessage(message.text);
            return;
          case "question-asked":
            newMessage('sent', message.text);
            if (message.isMath) {
              const response = await evaluate(message.text);
              newMessage('response', response);
            } else {
              const { data } = await axios.post<Response,AxiosResponse<Response>>(API_URL, {
                query: print(GET_QUESTION),
                variables: {
                  uid: "ARRAY_SORTING",
                },
              });
  
              if (data.data.questions.length === 0) {
                newMessage('response', 'Question not found, try again');
              } else {
                console.log(data.data.questions);
                const { title, description, url } = data.data.questions[0].information[0] as any;
                
                // TODO map function
                newMessage('response', `${title} <br> ${description}`);
                newMessage('response', `For futher information: ${url}`);
              }
            }

            this._panel.webview.html = this._getHtmlForWebview(messages);
            return;
        }
      },
      null,
      this._disposables
    );
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

  private _getHtmlForWebview(messages: Message[]) {
    // Local path to main script run in the webview
    const scriptPathOnDisk = vscode.Uri.file(
      path.join(this._extensionPath, "media", "main.js")
    );
    const scriptUri = this._panel.webview.asWebviewUri(scriptPathOnDisk);

    // Local path to main style sfile
    const stylesPathOnDisk = vscode.Uri.file(
      path.join(this._extensionPath, "media", "main.css")
    );
    const stylesUri = this._panel.webview.asWebviewUri(stylesPathOnDisk);

    return view({ stylesUri, messages, scriptUri });
  }
}