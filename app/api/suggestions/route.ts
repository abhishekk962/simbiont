import { generateText, Output } from "ai";
import { google } from "@ai-sdk/google";
import z from "zod";

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  console.log("Received prompt for suggestions:", prompt);

  const { output } = await generateText({
    model: google("gemini-3-flash-preview"),
    system: `You generate short concise suggestions about the next command the user should take 
    based on the given state of an app. For example, "Generate images for this node", "Break down this concept into smaller parts",
    "Research on this topic", "Search the web and find the latest news about this", "Summarize the content of this node". Always respond in the format of a short concise suggestion without any explanation.
    Play close attention to the history of the user's interactions and the current state of the app to generate relevant suggestions.`,
    prompt: `Here is the current state of the app:\n${prompt}\n\nBased on this state, give me 3 short concise suggestions for the next command the user should take. Always respond in the format of a short concise suggestion without any explanation.`,
    output: Output.object({
      schema: z.object({
        suggestions: z
          .array(z.string())
          .describe(
            "A list of short concise suggestions for the user on what to do next.",
          ),
      }),
    }),
  });

  return Response.json({ suggestions: output.suggestions });
}
