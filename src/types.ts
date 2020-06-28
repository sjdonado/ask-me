export interface Message {
  type: String;
  text: String;
  time: String;
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
