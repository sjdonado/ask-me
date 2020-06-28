import axios from "axios";

const BASE = "https://simple-bot-hackaton.herokuapp.com/bot-response";

interface Response {
  response: string;
}

export const queryBot = async (q: string) => {
  const { data } = await axios.get<Response>(BASE + "?s=" + q);
  return data.response;
};
