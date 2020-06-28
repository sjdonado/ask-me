import axios from "axios";

const BASE = "http://api.mathjs.org/v4/";

interface Response {
  result?: string;
  error?: string;
}

export const query = async (expr: string) => {
  const { data } = await axios.post<Response>(BASE, { expr });

  if (data.error) {
    return "Oops. Too dificult! 😩";
  }

  return data.result as string;
};
