export enum MessageType {
  CODE,
  IMAGE,
  INFORMATION,
  LINK,
  YOUTUBE,
}

export interface Tag {
  id: String;
  name: String;
}

export interface Question {
  id: String;
  title: String;
  uid: String;
  tags: Array<Tag>;
  information: Information;
}

interface UploadFile {
  url: String;
}

interface Component {
  __typename: String;
  id: String;
  url: String;
}

export interface ComponentResponseCodeSnippet extends Component {
  title: String;
  description: String;
  code: String;
}

export interface ComponentResponseImage extends Component {
  title: String;
  image: UploadFile;
}

export interface ComponentResponseInformationSnippet extends Component {
  title: String;
  description: String;
}

export interface ComponentResponseReferenceLink extends Component {
  title: String;
}

export interface ComponentResponseYoutubeVideo extends Component {
  title: String;
}

export type Components =
  | ComponentResponseCodeSnippet
  | ComponentResponseImage
  | ComponentResponseInformationSnippet
  | ComponentResponseReferenceLink
  | ComponentResponseYoutubeVideo;

export type Information = Array<
  | ComponentResponseCodeSnippet
  | ComponentResponseImage
  | ComponentResponseInformationSnippet
  | ComponentResponseReferenceLink
  | ComponentResponseYoutubeVideo
>;

export interface Response {
  data: {
    questions: Array<Question>;
  };
}
