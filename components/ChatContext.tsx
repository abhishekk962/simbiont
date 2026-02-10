"use client";

import { createContext } from "react";
import { UIMessage } from "@ai-sdk/react";
import { UIDataTypes, UITools, ChatRequestOptions } from "ai";
import { string } from "zod";

type ChatContextType = {
  messages: UIMessage<unknown, UIDataTypes, UITools>[];
  sendMessage: (message: any | string, options?: ChatRequestOptions) => void;
  setMessages: (messages: UIMessage[] | ((messages: UIMessage[]) => UIMessage[])) => void;
};

export const ChatContext = createContext<ChatContextType>({
  messages: [],
  sendMessage: () => {},
  setMessages: () => {},
});