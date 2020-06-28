import {
  Question,
  ComponentResponseCodeSnippet,
  ComponentResponseImage,
  ComponentResponseInformationSnippet,
  ComponentResponseReferenceLink,
  ComponentResponseYoutubeVideo,
  Information,
} from "./types";

/**
 * TODO
 * 
 * @param information
 */
const parseInformation = (information: Information) => {
  return information
    .map((component) => {
      switch (component.__typename) {
        case "ComponentResponseCodeSnippet": {
          break;
        }

        case "ComponentResponseImage": {
          break;
        }

        case "ComponentResponseInformationSnippet": {
          break;
        }

        case "ComponentResponseReferenceLink": {
          break;
        }

        case "ComponentResponseYoutubeVideo": {
          break;
        }
      }
    })
    .join("");
};

export const parseQuestion = (question: Question) => {
  const { id, information, title, tags, uid } = question;

  const parsedInformation = parseInformation(information);

  return `<div>
    <div>${parsedInformation}</div>
  </div>`;
};
