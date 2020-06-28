import gql from "graphql-tag";

export const GET_QUESTION =  gql`
  query getQuestion($uid: String) {
    questions(
      where: {
        uid: $uid
      }
    ) {
      id
      title
      uid
      tags {
        id
        name
      }
      information {
        __typename
        ... on ComponentResponseYoutubeVideo {
          id
          videoTitle: title
          videoUrl: url
        }
        ... on ComponentResponseCodeSnippet {
          id
          title
          description
          code
          url
        }
        ... on ComponentResponseInformationSnippet {
          id
          title
          description
          url
        }
        ... on ComponentResponseImage {
          id
          title
          url
          image {
            url
          }
        }
        ... on ComponentResponseReferenceLink {
          id
          title
          url
        }
      }
    }
  }
`;