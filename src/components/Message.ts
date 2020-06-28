import * as MarkdownIt from "markdown-it";
import * as hljs from "highlight.js";
import {
  ComponentResponseInformationSnippet,
  ComponentResponseImage,
  ComponentResponseYoutubeVideo,
  ComponentResponseReferenceLink,
  ComponentResponseCodeSnippet,
} from "./../types";

import { API_BASE } from "../config";

const md = new MarkdownIt({
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(lang, str).value;
      } catch (__) {}
    }

    return ""; // use external default escaping
  },
});

export abstract class Message {
  constructor(public time: Date) {}

  abstract toHtml(): String;

  get localeTime() {
    return this.time.toLocaleTimeString();
  }
}

export class MessageRequest extends Message {
  constructor(public text: String) {
    super(new Date());
  }

  toHtml() {
    return `
    <div class="message sent">
      <div class="text">${this.text}</div>
      <span class="time">${this.localeTime}</span>
    </div>`;
  }
}

// RESPONSES
const time = (localeTime: String) => `<span class="time">${localeTime}</span>`;

const seeMore = (url: string) =>
  url ? `<a class="button" href="${url}">See more 👀</a>` : "";

export class TextMessageResponse extends Message {
  constructor(public text: string) {
    super(new Date());
  }

  toHtml() {
    return `
    <div class="message response">
      <div class="text">${md.render(this.text)}</div>
      <span class="time">${this.localeTime}</span>
    </div>`;
  }
}

export class InformationMessageResponse extends Message {
  constructor(public messagePayload: ComponentResponseInformationSnippet) {
    super(new Date());
  }

  toHtml() {
    return `<div class="message response">
      <div class="text">
        ${md.render(this.messagePayload.description)}
      </div>
      ${seeMore(this.messagePayload.url)}
      ${time(this.localeTime)}
    </div>`;
  }
}

export class ImageMessageResponse extends Message {
  constructor(public messagePayload: ComponentResponseImage) {
    super(new Date());
  }

  toHtml() {
    return `<div class="message response">
      <img src="${this.messagePayload.image.url}" width="100%" />

      ${seeMore(this.messagePayload.url)}
      ${time(this.localeTime)}
  </div>`;
  }
}

export class ReferenceLinkMessageResponse extends Message {
  constructor(public messagePayload: ComponentResponseReferenceLink) {
    super(new Date());
  }

  toHtml() {
    return `<div class="message response">
      <div>Recomended link 😉: 
        <span class="title">
          <a href="${this.messagePayload.url}">${this.messagePayload.title}</a>
        </span>
      </div>
      
      ${time(this.localeTime)}
    </div>`;
  }
}

export class YoutubeVideoMessageResponse extends Message {
  constructor(public messagePayload: ComponentResponseYoutubeVideo) {
    super(new Date());
  }

  toHtml() {
    return `<div class="message response">
      <div class="text">Here is a (super interesting) video 👻:
        <span class="title">
          <a href="${this.messagePayload.videoUrl}">
          ${this.messagePayload.videoTitle}
          </a>
        </span>
      </div>
    </div>`;
  }
}

export class CodeSnippetMessageResponse extends Message {
  constructor(public messagePayload: ComponentResponseCodeSnippet) {
    super(new Date());
  }

  toHtml() {
    return `<div class="message response">
      <div class="text">${md.render(this.messagePayload.description)}</div>
      
      <div class="code">
        ${md.render(this.messagePayload.code)}
      </div>
      <button type="button" class="button copy-to-editor">Copy to editor</button>

      ${seeMore(this.messagePayload.url)}
      ${time(this.localeTime)}
    </div>`;
  }
}
