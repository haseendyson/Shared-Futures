import { ChatMessage } from "./chatTypes";
import { completeChat } from "./llm";

export type LanguageLevel = "basic" | "intermediate" | "advanced";

/** Direct port of conversation.py's detect_language_level. */
export async function detectLanguageLevel(
  messages: ChatMessage[],
  model: string
): Promise<LanguageLevel> {
  const userMessages = messages.filter((m) => m.role === "human").map((m) => m.content);
  if (userMessages.length === 0) return "intermediate";

  const userText = userMessages.slice(-5).join("\n\n");
  const prompt =
    "You are a helpful assistant that classifies how a person writes. " +
    "Read the user's responses below and choose one of these language levels:\n" +
    "- basic: short simple sentences and everyday words\n" +
    "- intermediate: clear language with moderate vocabulary and sentence length\n" +
    "- advanced: richer vocabulary and more complex sentences\n\n" +
    "Return exactly one word: basic, intermediate, or advanced." +
    "\n\nUser text:\n" +
    userText;

  try {
    const result = await completeChat(prompt, model, 0);
    const normalized = result.trim().toLowerCase();
    if (normalized.includes("basic")) return "basic";
    if (normalized.includes("advanced")) return "advanced";
    if (normalized.includes("intermediate")) return "intermediate";
    return "intermediate";
  } catch {
    return "intermediate";
  }
}
