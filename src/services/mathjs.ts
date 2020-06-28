import axios from "axios";

const BASE = "http://api.mathjs.org/v4/";

interface Response {
  result?: string;
  error?: string;
}

export const evaluate = async (expr: string) => {
  const { data } = await axios.post<Response>(BASE, { expr, precision: 3 });

  if (data.error) {
    return "Oops. Too dificult! 😩";
  }

  return `Easy! It's ${data.result as string} 🤓`;
};
