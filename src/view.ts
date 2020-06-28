import { Uri } from "vscode";

export default ({
  stylesUri,
  messages,
  scriptUri,
}: {
  stylesUri: Uri;
  messages: Array<{ type: String; text: String }>;
  scriptUri: Uri;
}) => {
  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ask me</title>
      <link rel="stylesheet" type="text/css" href="${stylesUri}">
  </head>
  <body>
      <div class="header">
          <h1>Welcome to Ask me :)</h1>
      </div>
      <div class="container">
          <div id="chat">${messages
            .map((msg) => `<p class="message ${msg.type}">${msg.text}</p>`)
            .join("")}</div>
          <form class="question-form" onsubmit="send()">
              <input id="question" type="text" placeholder="Type your question">
              <button type="submit">Send</button>
          </form>
      </div>
      <script src="${scriptUri}"></script>
  </body>
  </html>`;
};
