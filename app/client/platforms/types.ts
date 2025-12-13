import { ChatOptions } from "../api";

export type RequestPayload = {
  messages: ChatOptions["messages"];
  stream?: boolean;
  model: string;
  temperature?: number;
  presence_penalty?: number;
  frequency_penalty?: number;
  top_p?: number;
  max_tokens?: number;
  tools?: any;
};
