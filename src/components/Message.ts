import {
  ComponentResponseInformationSnippet,
  ComponentResponseImage,
  ComponentResponseYoutubeVideo,
  ComponentResponseReferenceLink,
  ComponentResponseCodeSnippet,
} from "./../types";
import { API_BASE } from "../config";

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

export class TextMessageResponse extends Message {
  constructor(public text: String) {
    super(new Date());
  }

  toHtml() {
    return `
    <div class="message response">
      <div class="text">${this.text}</div>
      <span class="time">${this.localeTime}</span>
    </div>`;
  }
}

export class InformationMessageResponse extends Message {
  constructor(public messagePayload: ComponentResponseInformationSnippet) {
    super(new Date());
  }

  toHtml() {
    // TODO
    return `<div class="message response">
      <div class="text">${this.messagePayload.description}</div>
      <span class="time">${this.localeTime}</span>
    </div>`;
  }
}

export class ImageMessageResponse extends Message {
  constructor(public messagePayload: ComponentResponseImage) {
    super(new Date());
  }

  toHtml() {
    // TODO
    return `<div class="message response">
    <div class="title">
      <a href="${this.messagePayload.url}">${this.messagePayload.title}</a>
    </div>
    <img src="${API_BASE + this.messagePayload.image.url}" width="100%" />
    <span class="time">${this.localeTime}</span>
  </div>`;
  }
}

export class ReferenceLinkMessageResponse extends Message {
  constructor(public messagePayload: ComponentResponseReferenceLink) {
    super(new Date());
  }

  toHtml() {
    return `<div class="message response">
      <a href="${this.messagePayload.url}">${this.messagePayload.title}</a>
      <span class="time">${this.localeTime}</span>
    </div>`;
  }
}

export class YoutubeVideoMessageResponse extends Message {
  constructor(public messagePayload: ComponentResponseYoutubeVideo) {
    super(new Date());
  }

  toHtml() {
    return `<div class="message response">
      <!-- <iframe id="ytplayer" type="text/html" width="640" height="360"
      src="http://www.youtube.com/embed/M7lc1UVf-VE?autoplay=1&origin=http://example.com"
      frameborder="0"/> -->
    </div>`;
  }
}

export class CodeSnippetMessageResponse extends Message {
  constructor(public messagePayload: ComponentResponseCodeSnippet) {
    super(new Date());
  }

  toHtml() {
    return `<div class="message response">
      Code Snippet
    </div>`;
  }
}
