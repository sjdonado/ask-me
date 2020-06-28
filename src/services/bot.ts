import axios from "axios";
import { BOT_API_URL } from "../config";

interface Response {
  response: string;
}

export const queryBot = async (q: string) => {
  const { data } = await axios.get<Response>(`${BOT_API_URL}?=${q}`);
  return data.response;
};
