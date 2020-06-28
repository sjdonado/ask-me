export enum MessageType {
  CODE,
  IMAGE,
  INFORMATION,
  LINK,
  YOUTUBE,
}

export interface Tag {
  id: string;
  name: string;
}

export interface Question {
  id: string;
  title: string;
  uid: string;
  tags: Array<Tag>;
  information: Information;
}

interface UploadFile {
  url: string;
}

interface Component {
  __typename: string;
  id: string;
  url: string;
}

export interface ComponentResponseCodeSnippet extends Component {
  title: string;
  description: string;
  code: string;
}

export interface ComponentResponseImage extends Component {
  title: string;
  image: UploadFile;
}

export interface ComponentResponseInformationSnippet extends Component {
  title: string;
  description: string;
}

export interface ComponentResponseReferenceLink extends Component {
  title: string;
}

export interface ComponentResponseYoutubeVideo extends Component {
  videoTitle: string;
  videoUrl: string;
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
