import * as path from "path";
import * as vscode from "vscode";
import { ProgressLocation } from "vscode";
import axios, { AxiosResponse } from "axios";
import { print } from "graphql";

import view from "./view";

import { GET_QUESTION } from "./queries";
import { Response, Question } from "./types";
import { API_URL } from "./config";
import { evaluate } from "./services/mathjs";
import {
  Message,
  MessageRequest,
  TextMessageResponse,
} from "./components/Message";
import { parseQuestion } from "./utils";

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
    const messages: Array<Message> = [];
    this._panel = panel;
    this._extensionPath = extensionPath;

    const newMessage = (message: Message) => {
      messages.push(message);
    };

    // Initialize
    newMessage(new TextMessageResponse("Hi! 👀"));
    this._panel.webview.html = this._getHtmlForWebview(messages);

    // Listen for when the panel is disposed
    // This happens when the user closes the panel or when the panel is closed programatically
    this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

    // Handle messages from the webview
    this._panel.webview.onDidReceiveMessage(
      (message) => {
        switch (message.command) {
          case "alert":
            vscode.window.showErrorMessage(message.text);
            return;

          case "question-asked":
            vscode.window.withProgress(
              {
                location: ProgressLocation.Notification,
                title: "Answering...",
                cancellable: false,
              },
              async (progress) => {
                newMessage(new MessageRequest(message.text));
                if (message.isMath) {
                  const response = await evaluate(message.text);
                  newMessage(new TextMessageResponse(response));
                } else {
                  const { data } = await axios.post<Response>(API_URL, {
                    query: print(GET_QUESTION),
                    variables: {
                      uid: "ARRAY_SORTING",
                    },
                  });

                  if (data.data.questions.length === 0) {
                    newMessage(
                      new TextMessageResponse("Question not found. I'm still learning. 😢")
                    );
                  } else {
                    console.log(data.data.questions);

                    newMessage(
                      new TextMessageResponse("Heeey! Let me teach you 😎😛")
                    )

                    parseQuestion(data.data.questions[0]).map((message) =>
                      newMessage(message)
                    );
                  }
                }

                progress.report({ increment: 0 });

                this._panel.webview.html = this._getHtmlForWebview(messages);
              }
            );
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
