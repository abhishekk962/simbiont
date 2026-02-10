import {
  tool,
  ToolLoopAgent,
  stepCountIs,
  generateText,
  Output,
  hasToolCall,
  StopCondition,
  ToolSet,
  ModelMessage,
  generateImage,
} from "ai";
import { file, object, z } from "zod";
import { instructions } from "./prompt";
import { tavily } from "@tavily/core";
import { model, imageModel } from "./model";
import { uploadToBlob } from "./utils";
import { request } from "http";
import { title } from "process";
import { google } from "@ai-sdk/google";
import { googleTools } from "@ai-sdk/google/internal";


export const listCanvasNodes = tool({
  description: "List all nodes currently present on the canvas.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    nodes: z.string(),
  }),
});

export const readCanvasNode = tool({
  description: "Read the details of a specific node on the canvas by its ID.",
  inputSchema: z.object({
    nodeId: z.string().min(1),
    property: z.enum(["type", "title", "content"]),
  }),
  outputSchema: z.object({
    nodeDetails: z.string(),
  }),
});

export const updateCanvasNode = tool({
  description: "Update the details of a specific node on the canvas by its ID.",
  inputSchema: z.object({
    nodeId: z.string().min(1),
    property: z.enum(["title", "content"]),
    newValue: z.string().min(1),
  }),
  outputSchema: z.object({
    updateStatus: z.string(),
  }),
});

export const createCanvasNode = tool({
  description:
    "Create a new node on the canvas with specified title and content. Keep content concise.",
  inputSchema: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    sourceNodeIds: z.array(z.string().min(1)).optional(),
  }),
  outputSchema: z.object({
    newNodeId: z.string(),
  }),
});

export const createImages = tool({
  description: "Use this tool only once to generate either one or more images.",
  inputSchema: z.object({
    request: z
      .string()
      .min(1)
      .describe(
        "The complete and exact request made by the user for image generation.",
      ),
    numberOfImages: z
      .number()
      .min(1)
      .max(5)
      .describe(
        "The number of images to generate based on the user's request.",
      ),
    imagePlacement: z
      .array(
        z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        }),
      )
      .describe(
        "If the user has provided a reference image with placeholders or boxes, provide the placement coordinates for each generated image relative to those boxes. The coordinates are always measured from the top-left corner of the reference image. The coordinates of the reference image itself can be assumed to be x: 0, y: 0, width: image-width, height: image-height.",
      )
      .optional(),
  }),
  outputSchema: z.object({
    result: z.string(),
    data: z.array(z.string()),
    coordResult: z
      .array(
        z.object({
          x: z.number(),
          y: z.number(),
          width: z.number(),
          height: z.number(),
        }),
      )
      .optional(),
  }),
  onInputStart(options) {
    // console.log(
    //   "createImage - onInputStart - options:",
    //   JSON.stringify(options.messages, null, 2),
    // );
  },
  execute: async ({ request, numberOfImages, imagePlacement }, options) => {
    const generatedImageUrls: string[] = [];

    let coordText = "";

    const result = await generateText({
      model: imageModel,
      messages: [
        {
          role: "user",
          content: `
          Create ${numberOfImages} images based on the user's request: ${request}.
          `,
        },
      ],
      stopWhen: [stepCountIs(5)],
    });
    console.log(
      // "createImages - generation result: fist 1000 chars:",
      // JSON.stringify(result.response.messages, null, 2).slice(0, 3000),
      // JSON.stringify(result.response.messages, null, 2).slice(-3000),
    );
    // localStorage.setItem("lastImageGenResult", JSON.stringify(result, null, 2));
    for (const file of result.files) {
      if (file.mediaType.startsWith("image/")) {
        generatedImageUrls.push(
          (await uploadToBlob("data:image/jpeg;base64," + file.base64)).url,
        );
      }
    }
    return {
      result:
        "Image created successfully and sent to user. Acknowledge saying it is done without repeating details.",
      data: generatedImageUrls,
      coordResult: imagePlacement,
    };
  },
});

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });
export const webSearch = tool({
  description:
    "Search the web for a question and provide sources with an optional summary.",
  inputSchema: z.object({
    question: z.string(),
    includeSummary: z.boolean().optional(),
  }),
  outputSchema: z.object({
    summary: z.string().optional(),
    sources: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        content: z.string(),
      }),
    ),
  }),
  execute: async ({ question, includeSummary }) => {
    const { results } = await tvly.search(question, { maxResults: 5 });
    const sources = results.map(({ title, url, content }) => ({
      title,
      url,
      content,
    }));

    if (!includeSummary) return { sources };

    const { text: summary } = await generateText({
      model,
      prompt: `Answer "${question}" using these results:\n${sources.map((s) => `${s.title}: ${s.content}`).join("\n")}`,
    });

    return { summary, sources };
  },
});

export const createResearchNode = tool({
  description:
    "Add a research node on canvas for a topic by searching the web and summarizing findings.",
  inputSchema: z.object({
    topic: z.string(),
    sourceNodeIds: z.array(z.string().min(1)).optional(),
  }),
  outputSchema: z.object({
    title: z.string().describe("The title of the research summary."),
    result: z
      .string()
      .describe(
        "A long summary of the research findings on the given topic in markdown format.",
      ),
    sources: z.array(
      z.object({
        title: z.string(),
        url: z.string(),
        content: z.string(),
      }),
    ),
  }),
  execute: async ({ topic, sourceNodeIds }) => {
    const { results } = await tvly.search(topic, { maxResults: 1 });
    const sources = results.map(({ title, url, content }) => ({
      title,
      url,
      content,
    }));
    const { text } = await generateText({
      model,
      prompt: `Summarize the key findings in markdown format on the topic "${topic}" based on these sources:\n${sources.map((s) => `${s.title}: ${s.content}`).join("\n")}`,
    });

    return { title: topic, result: text, sources, sourceNodeIds };
  },
});

export const getPlanDetails = tool({
  description: "Get the details of the plan which you will create steps for.",
  inputSchema: z.object({
    purpose: z.string().describe("The purpose of the plan."),
    sourceNodeIds: z.array(z.string().min(1)).optional(),
  }),
  outputSchema: z.object({
    planDetails: z
      .string()
      .describe(
        "The details of the plan including constraints, timeline, budget, and scale.",
      ),
  }),
});

export const addPlanStepNodes = tool({
  description:
    "Add nodes for each step of a plan on the canvas. The input will be a list of steps with details.",
  inputSchema: z.object({
    steps: z.array(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        hasCostsAssociated: z.boolean(),
        estimatedCost: z
          .number()
          .optional()
          .describe(
            "Must be provided if hasCostsAssociated is true. In dollars.",
          ),
        hasTimeAssociated: z.boolean(),
        estimatedTime: z
          .number()
          .optional()
          .describe("Must be provided if hasTimeAssociated is true. In days"),
        hasAdditionalTagsAssociated: z
          .boolean()
          .optional()
          .describe(
            "Tags such as resources, goals, etc based on the user's request that are relevant to the step",
          ),
        additionalTags: z.array(z.string()).optional(),
        tasks: z
          .array(z.string().max(30))
          .optional()
          .describe("A list of tasks to be accomplished in this step."),
      }),
    ),
    keywordsForImageSearch: z
      .array(z.string())
      .max(3)
      .describe(
        "A list of keywords to use for searching images to associate with each step.",
      ),
  }),
  outputSchema: z.object({
    nodeIds: z.array(z.string()),
  }),
});

export const runSimulation = tool({
  description:
    "Run a simulation of the plan using the provided details and steps.",
  inputSchema: z.object({
    planDetails: z
      .string()
      .describe(
        "The details of the plan including constraints, timeline, budget, and scale.",
      ),
    variables: z
      .string()
      .describe(
        "The variables to be used in the simulation and their possible values.",
      ),
  }),
  outputSchema: z.object({
    result: z.string().describe("The result of the simulation or the required additional information."),
  }),
  execute: async ({ planDetails, variables }) => {
    const { text, toolCalls, toolResults } = await generateText({
      model: google("gemini-3-pro-preview"),
      tools: { code_execution: google.tools.codeExecution({}) },
      prompt: `Use python to run an optimisation algorithm for the following plan details and variables. 
      Plan Details: " + ${planDetails} + " Variables: " + ${variables}
      You must first construct a model of the problem by defining the decision variables, objective function, and constraints based on the plan details and variables provided.
      You may use linear programming or any other optimisation technique you find suitable.
      If you face errors with a particular library or approach, feel free to switch to a different one.
      If it still doesn't work, go for the simplest possible approach even if it is not the most efficient one.
      If enough variables are not provided, ask for them.
      If variables are sufficient, but a specific goal is not provided, go ahead with a reasonable assumption for the goal.
      At the end, give a tldr of the results of the simulation and what they imply for the plan.
      Also give two tables showing the standard and optimised values.
      `,
      stopWhen: [stepCountIs(5)],
    });
    console.log("Simulation result:", toolResults);

    const result = await generateText({
      model: google("gemini-3-flash-preview"),
      prompt: `Given the following simulation results: ${text},
      assess if the simulation was successful or not. If it was successful,
      give a concise summary of results in markdown format. 
      Show a before table and an after table. along with one sentence on 
      how it was optimised and another on why it matters.
      Otherwise, if not successful, share what information was provided to you.
      `,
    });
    console.log("Simulation assessment result:", result.text);
    return { result: result.text + toolResults.map(tr => tr.input).join("\n") + toolResults.map(tr => tr.output).join("\n")};
  },
});

export const getRealtimeTrends = tool({
  description: "Get the current real-time trends on the web from google trends.",
  inputSchema: z.object({
    category: z.string().optional().describe("The category to get trends for."),
    location: z.string().optional().describe("The location to get trends for."),
  }),
  outputSchema: z.object({
    trends: z.string().describe("The current trends based on the given category and location."),
  }),
  execute: async ({ category, location }) => {
    const { text, sources, providerMetadata } = await generateText({
      model: google('gemini-3-flash-preview'),
      prompt: `Based on the document: https://trends.google.com/trending?geo=US.
              Answer this question: What is trending right now?`,
      tools: {
        url_context: google.tools.urlContext({}),
      },
      providerOptions: {
        google: {
          thinkingConfig : {
            thinkingLevel: "minimal",
          }
        },
      },
    });
    return { trends: text };
  }
});


