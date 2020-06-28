import { Uri } from "vscode";

import { Message } from "./types";

const messageComponent = ({ type, text, time }: Message) =>
  `<div class="message ${type}">
    <div class="text">${text}</div>
    <span class="time">${time}</span>
  </div>`;

export default ({
  stylesUri,
  messages,
  scriptUri,
}: {
  stylesUri: Uri;
  messages: Array<Message>;
  scriptUri: Uri;
}) => {
  const messagesComponents = messages.map(messageComponent).join("");

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Ask me 🤖</title>
      <link rel="stylesheet" type="text/css" href="${stylesUri}">
      <script src="https://unpkg.com/complex-js@5.0.0/dst/complex.min.js"></script>
  </head>
  <body>
      <div class="header">
          <h1>Welcome to Ask me 🤖</h1>
          <span>Ask me about code fundamentals</span>
      </div>
      <div class="container">
          <div id="chat">${messagesComponents}</div>
          <form class="question-form" onsubmit="send()">
              <input id="question" type="text" placeholder="Type your question...">
              <button type="submit">Send</button>
          </form>
      </div>
      <script src="${scriptUri}"></script>
  </body>
  </html>`;
};
