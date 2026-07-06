export interface ChatMessage {
  role: "human" | "ai";
  content: string;
}

/** Renders messages the same way ConversationBufferMemory's default format does. */
export function formatHistory(messages: ChatMessage[]): string {
  return messages
    .map((m) => `${m.role === "human" ? "Human" : "AI"}: ${m.content}`)
    .join("\n");
}
