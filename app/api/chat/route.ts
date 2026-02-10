import {
  createAgentUIStreamResponse,
  UIMessage,
  UIDataTypes,
  UITools,
  pruneMessages,
  isFileUIPart,
  ToolLoopAgent,
  ToolSet,
  stepCountIs,
  tool,
  getToolName,
} from "ai";
import {
  listCanvasNodes,
  readCanvasNode,
  updateCanvasNode,
  createCanvasNode,
  webSearch,
  createImages,
  createResearchNode,
  addPlanStepNodes,
  getPlanDetails,
  runSimulation,
  getRealtimeTrends,
} from "./agent";
import { instructions } from "./prompt";
import { model } from "./model";
import { put } from "@vercel/blob";
import { uploadToBlob } from "./utils";
import { google } from "@ai-sdk/google";

export const maxDuration = 30;
let finalImageUrl: string | null = null;

export async function POST(request: Request) {
  const { messages, state }: { messages: UIMessage[]; state: any } =
    await request.json();

  // console.log("route - messages received:", JSON.stringify(messages, null, 2));

  const toolsUsed = messages
    .flatMap((msg) =>
      msg.parts
        .filter((part) => part.type.startsWith("tool"))
        .map((part) => part.type.replace("tool-", "")),
    )
    .filter((value, index, self) => self.indexOf(value) === index);

  const finalReplyComment: any = messages
    .filter((msg) => msg.parts.some((part) => part.type === "tool-finalReply"))
    .map((msg) => msg.parts.filter((part) => part.type === "tool-finalReply"))
    .flat()[0];

  const stateText =
    `Given Below is the current 'state' of the user's data. You MUST refer to this while responding.` +
    JSON.stringify(state, null, 2);

  const toolsUsedText = `You used the following tools: ${toolsUsed.join(
    ", ",
  )} and your reply to the user was: ${
    finalReplyComment?.input?.comments || "N/A"
  }. Continue assisting the user based on the current state.`;

  const convertFileDataUrlsToBlobs = async (messages: UIMessage[]) => {
    const updatedMessages: UIMessage[] = [];
    for (const message of messages) {
      const updatedParts: typeof message.parts = [];
      for (const part of message.parts) {
        if (isFileUIPart(part) && part.url.startsWith("data:")) {
          const putResult = await uploadToBlob(part.url);
          const updatedPart: typeof part = {
            ...part,
            url: putResult.url,
          };
          updatedParts.push(updatedPart);
        } else {
          updatedParts.push(part);
        }
      }
      updatedMessages.push({
        ...message,
        parts: updatedParts,
      });
    }
    return updatedMessages;
  };
  const messagesWithBlobs = await convertFileDataUrlsToBlobs(messages);

  const agent = new ToolLoopAgent({
    model,
    instructions: instructions + "\n" + stateText + "\n" + toolsUsedText,
    tools: {
      listCanvasNodes,
      readCanvasNode,
      updateCanvasNode,
      createCanvasNode,
      webSearch,
      createImages,
      createResearchNode,
      getPlanDetails,
      addPlanStepNodes,
      runSimulation,
      getRealtimeTrends,
    } satisfies ToolSet,
    stopWhen: [stepCountIs(5)],
    // prepareCall: async (options) => {
    //   // Log the generated Image URL from the previous step
    //   // console.log(
    //   //   "prepareCall - options.prompt:",
    //   //   JSON.stringify(options.prompt, null, 2),
    //   // );
    //   const lastMessage = options.prompt
    //     ? options.prompt[options.prompt.length - 1]
    //     : undefined;
    //   const imagePart =
    //     lastMessage &&
    //     typeof lastMessage === "object" &&
    //     Array.isArray(lastMessage.content)
    //       ? lastMessage.content.find(
    //           (part: any) =>
    //             typeof part === "object" && part.mediaType?.startsWith("image"),
    //         )
    //       : null;
    //   finalImageUrl = imagePart ? (imagePart as any).data : null;
    //   return options;
    // },
    prepareStep: async ({ stepNumber, steps }) => {
      if (stepNumber < 1) {
        return {
          activeTools: [
            "webSearch",
            "listCanvasNodes",
            "readCanvasNode",
            "createCanvasNode",
            "createResearchNode",
            "createImages",
            "getPlanDetails",
            "getRealtimeTrends",
          ],
          toolChoice: "required",
          providerOptions: {
            google: {
              thinkingLevel: "low",
            },
          }
        };
      }
      if (stepNumber > 0) {
        return {
          activeTools: [
            "webSearch",
            "listCanvasNodes",
            "readCanvasNode",
            "createCanvasNode",
            "createResearchNode",
            "getPlanDetails",
            "getRealtimeTrends",

            "updateCanvasNode",
            "addPlanStepNodes",
            "runSimulation",
          ],
          toolChoice: "auto",
        };
      }
    },
    // onStepFinish: (data) => {
    //   console.log("Step finished:", JSON.stringify(data.response.messages, null, 2));
    // }
  });

  return createAgentUIStreamResponse({
    agent,
    uiMessages: messagesWithBlobs,
  });
}
