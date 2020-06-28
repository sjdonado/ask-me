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
  information: any;
}
