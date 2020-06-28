import * as path from "path";
import * as vscode from "vscode";
import { ProgressLocation } from "vscode";
import axios from "axios";
import { print } from "graphql";

import view from "./view";

import { GET_QUESTION } from "./queries";
import { Response } from "./types";
import { API_URL } from "./config";
import { evaluate } from "./services/mathjs";
import { queryBot } from "./services/bot";
import {
  Message,
  MessageRequest,
  TextMessageResponse,
} from "./components/Message";
import { parseQuestion } from "./utils";

const languages = {
  Auto: "auto",
  Python: "py",
  Javascript: "js",
};

const types = [
  "ARRAYS_SORTING",
  "LOOPS_FOR",
  "LOOPS_WHILE",
  "CONDITIONALS_IF",
  "STRINGS_MANIPULATION",
];

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

  public static createOrShow(
    extensionPath: string,
    language: keyof typeof languages
  ) {
    const column = vscode.ViewColumn.Two;

    let detectedLanguage: keyof typeof languages = language;
    if (language === "Auto" && vscode.window.activeTextEditor) {
      switch (vscode.window.activeTextEditor.document.languageId) {
        case "python":
          detectedLanguage = "Python";
          break;
        case "javascript":
          detectedLanguage = "Javascript";
          break;
      }
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
      column,
      {
        // Enable javascript in the webview
        enableScripts: true,

        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [
          vscode.Uri.file(path.join(extensionPath, "media")),
        ],
      }
    );

    WebViewPanel.currentPanel = new WebViewPanel(
      panel,
      extensionPath,
      detectedLanguage
    );
  }

  public static revive(
    panel: vscode.WebviewPanel,
    extensionPath: string,
    language: keyof typeof languages
  ) {
    WebViewPanel.currentPanel = new WebViewPanel(
      panel,
      extensionPath,
      language
    );
  }

  private constructor(
    panel: vscode.WebviewPanel,
    extensionPath: string,
    language: keyof typeof languages
  ) {
    let messages: Array<Message> = [];
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
            vscode.window.showErrorMessage(message.data);
            return;
          case "open-in-editor":
            if (
              vscode.workspace.workspaceFolders &&
              vscode.workspace.workspaceFolders.length > 0
            ) {
              const newFile = vscode.Uri.parse(
                "untitled:" +
                  path.join(
                    vscode.workspace.workspaceFolders[0].uri.path,
                    `example.${languages[language]}`
                  )
              );
              vscode.workspace.openTextDocument(newFile).then((document) => {
                const edit = new vscode.WorkspaceEdit();
                edit.insert(newFile, new vscode.Position(0, 0), message.data);
                return vscode.workspace.applyEdit(edit).then((success) => {
                  if (success) {
                    vscode.window.showTextDocument(document);
                  } else {
                    vscode.window.showInformationMessage("Error!");
                  }
                });
              });
            } else {
              vscode.window.showErrorMessage("Workspace not found");
            }
            return;

          case "question-asked":
            vscode.window.withProgress(
              {
                location: ProgressLocation.Notification,
                title: "Answering...",
                cancellable: false,
              },
              async (progress) => {
                try {
                  newMessage(new MessageRequest(message.data));

                  if (message.data.trim() === "clear") {
                    messages = [];
                    newMessage(new TextMessageResponse("Hi! 👀"));
                  } else if (message.isMath) {
                    const response = await evaluate(message.data);
                    newMessage(new TextMessageResponse(response));
                  } else {
                    const response = await queryBot(message.data);

                    if (types.includes(response)) {
                      const { data } = await axios.post<Response>(API_URL, {
                        query: print(GET_QUESTION),
                        variables: {
                          uid: response,
                        },
                      });

                      if (data.data.questions.length === 0) {
                        newMessage(
                          new TextMessageResponse(
                            "Question not found. I'm still learning. 😢"
                          )
                        );
                      } else {
                        newMessage(
                          new TextMessageResponse(
                            "Heeey! Let me teach you 😎😛"
                          )
                        );

                        parseQuestion(data.data.questions[0]).map((message) =>
                          newMessage(message)
                        );
                      }
                    } else {
                      newMessage(new TextMessageResponse(response));
                    }
                  }

                  progress.report({ increment: 0 });

                  this._panel.webview.html = this._getHtmlForWebview(messages);
                } catch (err) {
                  vscode.window.showErrorMessage(err.message);
                }
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

    const vs2015 = this._panel.webview.asWebviewUri(
      vscode.Uri.file(path.join(this._extensionPath, "media", "vs2015.css"))
    );

    return view({ stylesUri, messages, scriptUri, vs2015 });
  }
}
