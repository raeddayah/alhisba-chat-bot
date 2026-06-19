import { createContext, useContext } from "react";

interface ChatContextValue {
  ask: (message: string) => void;
}

export const ChatContext = createContext<ChatContextValue>({
  ask: () => {},
});

export function useChatContext() {
  return useContext(ChatContext);
}
