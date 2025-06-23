import { streamText } from "ai";
import { google } from "@ai-sdk/google";

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  const result = streamText({
    model: google("models/gemini-2.0-flash"),
    system: `You are a helpful assistant. When answering questions, always prioritize and use the provided context first. Only rely on your own knowledge if the context is insufficient. Keep your responses concise, clear, and to the point. ${context}`,
    messages,
  });

  return result.toDataStreamResponse();
}
