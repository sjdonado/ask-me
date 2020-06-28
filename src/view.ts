import { Uri } from "vscode";
import {
  MessageRequest,
  InformationMessageResponse,
  ImageMessageResponse,
  ReferenceLinkMessageResponse,
  TextMessageResponse,
  Message,
} from "./components/Message";

export default ({
  stylesUri,
  messages,
  scriptUri,
  vs2015,
}: {
  stylesUri: Uri;
  messages: Array<Message>;
  scriptUri: Uri;
  vs2015: Uri;
}) => {
  const messagesComponents = messages
    .map((message) => message.toHtml())
    .map((r) => {
      console.log(r);
      return r;
    })
    .join("");

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ask me 🤖</title>
      <link rel="stylesheet" type="text/css" href="${stylesUri}">
      <link rel="stylesheet" type="text/css" href="${vs2015}">
      <link rel="stylesheet" href="https://cdn.plyr.io/3.6.2/plyr.css" />
      <script src="https://unpkg.com/complex-js@5.0.0/dst/complex.min.js"></script>
  </head>
  <body>
      <div class="header">
          <h1>Ask me 🤖</h1>
          <h4>Your smart assistant for coding</h4>
      </div>
      <div class="container">
          <div id="chat">${messagesComponents}</div>
          <form class="question-form" onsubmit="send()">
              <input id="question" type="text" placeholder="Type your question...">
              <button type="submit">Send</button>
          </form>
      </div>
      <script src="${scriptUri}"></script>
      <script src="https://cdn.plyr.io/3.6.2/plyr.js"></script>
  </body>
  </html>`;
};
