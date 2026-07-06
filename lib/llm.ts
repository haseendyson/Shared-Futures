import OpenAI from "openai";

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set.");
    }
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

/**
 * Sends a single fully-rendered prompt string to the chat model and returns
 * the raw text response. This mirrors how the original app used LangChain's
 * PromptTemplate + ChatOpenAI: the entire conversation (persona, questions,
 * history, and the trailing "AI: ") is rendered into one string and sent as
 * a single message, letting the model continue from "AI: ".
 */
export async function completeChat(
  prompt: string,
  model: string,
  temperature: number
): Promise<string> {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model,
    temperature,
    messages: [{ role: "user", content: prompt }],
  });
  return completion.choices[0]?.message?.content ?? "";
}

/** Same as completeChat, but asks the model to return raw JSON and parses it. */
export async function completeJson<T = unknown>(
  prompt: string,
  model: string,
  temperature: number
): Promise<T> {
  const openai = getClient();
  const completion = await openai.chat.completions.create({
    model,
    temperature,
    response_format: { type: "json_object" },
    messages: [{ role: "user", content: prompt }],
  });
  const text = completion.choices[0]?.message?.content ?? "{}";
  return JSON.parse(text) as T;
}
