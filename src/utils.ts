import {
  Question,
  ComponentResponseCodeSnippet,
  ComponentResponseImage,
  ComponentResponseInformationSnippet,
  ComponentResponseReferenceLink,
  ComponentResponseYoutubeVideo,
  Information,
} from "./types";
import {
  InformationMessageResponse,
  ImageMessageResponse,
  ReferenceLinkMessageResponse,
  YoutubeVideoMessageResponse,
  CodeSnippetMessageResponse,
} from "./components/Message";

export const parseQuestion = (question: Question) => {
  const { id, information, title, tags, uid } = question;

  return information.map((component) => {
    switch (component.__typename) {
      case "ComponentResponseCodeSnippet": {
        return new CodeSnippetMessageResponse(
          component as ComponentResponseCodeSnippet
        );
      }

      case "ComponentResponseImage": {
        return new ImageMessageResponse(component as ComponentResponseImage);
      }

      case "ComponentResponseReferenceLink": {
        return new ReferenceLinkMessageResponse(
          component as ComponentResponseReferenceLink
        );
      }

      case "ComponentResponseYoutubeVideo": {
        return new YoutubeVideoMessageResponse(
          component as ComponentResponseYoutubeVideo
        );
      }

      default: {
        return new InformationMessageResponse(
          component as ComponentResponseInformationSnippet
        );
      }
    }
  });
};
