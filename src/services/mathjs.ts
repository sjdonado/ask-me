import axios from "axios";
import { MATHJS_URL } from "../config";

interface MathjsResponse {
  result?: string;
  error?: string;
}

export const evaluate = async (expr: string) => {
  const { data } = await axios.post<MathjsResponse>(MATHJS_URL, {
    expr,
    precision: 3,
  });

  if (data.error) {
    return "Oops. Too dificult! 😩";
  }

  return `Easy! It's ${data.result as string} 🤓`;
};
