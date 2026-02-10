"use client";

import { useChat } from "@ai-sdk/react";
import { useState, useEffect, use, useContext, useRef } from "react";
import { ChatContext } from "@/components/ChatContext";
import { StateContext } from "@/components/StateContext";
import { UIMessage } from "@ai-sdk/react";
import {
  UIDataTypes,
  UITools,
  getStaticToolName,
  isTextUIPart,
  lastAssistantMessageIsCompleteWithToolCalls,
  tool,
} from "ai";
import { set, z } from "zod";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { mergeTags } from "@/lib/utils";
import { toast } from "sonner";
import { DefaultChatTransport, isStaticToolUIPart } from "ai";
import {
  useReactFlow,
  type Node,
  type Edge,
  getNodesBounds,
} from "@xyflow/react";
import { getRelativePositionWithNodeId } from "@/lib/nodesEdges";
import { randFloat, randInt } from "three/src/math/MathUtils.js";
import { type State } from "@/lib/state";
import { sources } from "next/dist/compiled/webpack/webpack";
import { speakText } from "@/lib/utils";
import {
  fetchUnsplashPhotos,
  type UnsplashPhoto,
  type UnsplashResponse,
} from "@/lib/unsplash";
import { get } from "http";

export function Chat({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>({});
  const {
    screenToFlowPosition,
    getNodes,
    updateNodeData,
    setNodes,
    getNode,
    setEdges,
    fitView,
    getViewport,
  } = useReactFlow();

  const { messages, sendMessage, setMessages, status, addToolOutput } = useChat(
    {
      transport: new DefaultChatTransport({
        api: "/api/chat",
      }),
      onFinish: () => {
        toast.getToasts().forEach((t) => {
          toast.dismiss(t.id);
        });
      },
      sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
      onError: (error) => {
        toast.getToasts().forEach((t) => {
          toast.dismiss(t.id);
        });
        toast.error(`Error: ${error.message}`, { id: "toastMessage" });
      },
    },
  );

  const processedToolCalls = useRef<Set<string>>(new Set());

  useEffect(() => {
    const lastUserMessageIndex = messages.findLastIndex(
      (m) => m.role === "user",
    );
    const lastUserMessageId =
      lastUserMessageIndex !== -1 ? messages[lastUserMessageIndex].id : null;
    const history = [
      messages
        .findLast((m) => m.role === "user")
        ?.parts.find((part) => part.type === "text")?.text,
    ];
    console.log(messages);
    messages?.map(async (m, messageIndex) =>
      m.parts?.map(async (part, i) => {
        if (isTextUIPart(part) && m.role === "assistant") {
          // console.log("Text part:", part, m);
          // toast.dismiss("toastMessage");
          // toast.success(part.text, { id: "toastMessage" + messageIndex });
          // speakText(part.text);
          // fitView({ duration: 1000, interpolate: "smooth", padding: 2 });
          if (messageIndex > lastUserMessageIndex) {
            history.push(`AI: ${part.text}`);
          }
        }

        if (isStaticToolUIPart(part) && part.state === "input-available") {
          const toolName = getStaticToolName(part);
          const toolCallId = part.toolCallId;

          if (toolName === "askQuestion") {
            type AskQuestionInput = {
              question: string;
            };
            const id = crypto.randomUUID();
            const questionNode: Node = {
              id,
              type: "question",
              position: screenToFlowPosition({
                x: getViewport().x + screen.availWidth/2,
                y: getViewport().y + screen.availHeight/2,
              }),
              data: {
                question: (part.input as AskQuestionInput).question,
                addToolOutput,
                toolCallId,
                tool: toolName,
              },
            };
            setNodes((nodes) => nodes.concat(questionNode));
          }
          if (toolName === "listCanvasNodes") {
            addToolOutput({
              toolCallId,
              tool: toolName,
              output: {
                nodes: getNodes()
                  .map((n) => n.id)
                  .join(", "),
              },
              state: "output-available",
            });
          }
          if (toolName === "readCanvasNode") {
            type ReadCanvasInput = {
              nodeId: string;
              property: "type" | "title" | "content";
            };
            const nodeId = (part.input as ReadCanvasInput).nodeId;
            const node = getNode(nodeId);
            const property = (part.input as ReadCanvasInput).property;
            let propertyValue = "";
            if (node) {
              if (property === "type") {
                propertyValue = node.type || "No type";
              } else if (property === "title") {
                propertyValue =
                  (node.data && (node.data as any).title) || "No title";
              } else if (property === "content") {
                propertyValue =
                  (node.data && (node.data as any).content) || "No content";
              }
            }
            addToolOutput({
              toolCallId,
              tool: toolName,
              output: {
                nodeDetails: propertyValue,
              },
              state: "output-available",
            });
          }
          if (toolName === "updateCanvasNode") {
            type UpdateCanvasInput = {
              nodeId: string;
              property: "type" | "title" | "content";
              newValue: string;
            };
            const nodeId = (part.input as UpdateCanvasInput).nodeId;
            const property = (part.input as UpdateCanvasInput).property;
            const newValue = (part.input as UpdateCanvasInput).newValue;
            const node = getNode(nodeId);
            if (node) {
              if (property === "type") {
                updateNodeData(nodeId, {
                  ...(node.data || {}),
                  type: newValue,
                });
              } else if (property === "title") {
                updateNodeData(nodeId, {
                  ...(node.data || {}),
                  title: newValue,
                });
              } else if (property === "content") {
                updateNodeData(nodeId, {
                  ...(node.data || {}),
                  content: newValue,
                });
              }
              updateNodeData(nodeId, {
                history: [...((node?.data as any).history || []), ...history],
              });
            }

            addToolOutput({
              toolCallId,
              tool: toolName,
              output: {
                updateStatus: `Node ${nodeId} updated successfully.`,
              },
              state: "output-available",
            });
          }
          if (toolName === "createCanvasNode") {
            type CreateCanvasInput = {
              type: string;
              title: string;
              content: string;
              sourceNodeIds?: string[];
              relativePosition?: "above" | "below" | "left" | "right";
            };
            const inputPart = part.input as CreateCanvasInput;
            const nodeType = inputPart.type;
            const title = inputPart.title;
            const content = inputPart.content;
            const sourceNodeIds = inputPart.sourceNodeIds;
            const currentNodes = getNodes().filter((n) => n.type === nodeType);
            console.log("Current Viewport:", getViewport());
            let position;
            if (sourceNodeIds)
              position = getRelativePositionWithNodeId(
                "right",
                sourceNodeIds[0],
                getNode,
              );
            else if (currentNodes.length > 0)
              position = getRelativePositionWithNodeId(
                "below",
                currentNodes[currentNodes.length - 1].id,
                getNode,
              );
            else {
              position = screenToFlowPosition({
                x: getViewport().x * randFloat(0.8, 1.2) + randInt(-300, 300),
                y: getViewport().y * randFloat(0.3, 1.7) + randInt(-300, 300),
              });
            }

            const id = crypto.randomUUID();
            const newNode: Node = {
              id,
              type: nodeType || "any",
              position: position,
              data: {
                title,
                content,
                history: history,
                historyId: lastUserMessageId,
                historyEdgeIds: [],
              },
            };

            setNodes((nodes) => nodes.concat(newNode));
            // if (sourceNodeIds && sourceNodeIds.length > 0) {
            //   const newEdge: Edge = {
            //     id: crypto.randomUUID(),
            //     target: lastUserMessageId || "",
            //     source: sourceNodeIds[0] || "",
            //   };
            //   setEdges((edges) => edges.concat(newEdge));
            // }
            const historyEdgeIds: string[] = [];
            sourceNodeIds?.forEach((sourceNodeId) => {
              const newEdge: Edge = {
                id: crypto.randomUUID(),
                type: "custom",
                source: sourceNodeId,
                target: id || "",
                data: {
                  history: history,
                },
              };
              setEdges((edges) => edges.concat(newEdge));
              historyEdgeIds.push(newEdge.id);
            });
            updateNodeData(id, { ...newNode.data, historyEdgeIds });
            addToolOutput({
              toolCallId,
              tool: toolName,
              output: {
                newNodeId: id,
              },
              state: "output-available",
            });
          }
          if (toolName === "getPlanDetails") {
            type GetPlanDetailsInput = {
              purpose: string;
              sourceNodeIds?: string[];
            };
            const inputPart = part.input as GetPlanDetailsInput;
            const sourceNodeIds = inputPart.sourceNodeIds;
            let position;
            if (sourceNodeIds)
              position = getRelativePositionWithNodeId(
                "right",
                sourceNodeIds[0],
                getNode,
              );
            else {
              position = screenToFlowPosition({
                x: getViewport().x * randFloat(0.8, 1.2) + randInt(-300, 300),
                y: getViewport().y * randFloat(0.3, 1.7) + randInt(-300, 300),
              });
            }

            const planNode: Node = {
              id: crypto.randomUUID(),
              type: "plan",
              position: position,
              data: {
                addToolOutput,
                toolCallId,
                tool: toolName,
              },
            }
            setNodes((nodes) => nodes.concat(planNode));
            fitView({
              duration: 1000,
              interpolate: "smooth",
              padding: 0.1,
              nodes: [planNode],
            });
          }
          if (toolName === "addPlanStepNodes") {
            type AddPlanStepNodesInput = {
              steps: {
                title: string;
                content: string;
                hasCostsAssociated: boolean;
                estimatedCost?: number;
                hasTimeAssociated: boolean;
                estimatedTime?: number;
                hasAdditionalTagsAssociated: boolean;
                additionalTags?: string[];
                tasks: string[];
              }[];
              keywordsForImageSearch: string[];
            };
            const inputPart = part.input as AddPlanStepNodesInput;

            const imageUrls: string[] = [];
            await Promise.all(
              inputPart.keywordsForImageSearch.map((keyword) =>
              fetchUnsplashPhotos({ query: keyword, page: 1 }).then(
                (response: UnsplashResponse) => {
                const urls = response.photos.map(
                  (photo: UnsplashPhoto) => photo.urls.small,
                );
                imageUrls.push(...urls);
                },
              ),
              ),
            );

            console.log(
              "Fetched image URLs for keywords",
              inputPart.keywordsForImageSearch,
              ":",
              imageUrls,
            );

            const steps = inputPart.steps;
            const planNodeId = getNodes().find((n) =>
              n.type === "plan")?.id;
            let prevId = planNodeId || crypto.randomUUID();
            steps.forEach((step, index) => {
              console.log("Adding step node for step:", imageUrls[index], step);
              const stepNodeId = crypto.randomUUID();
              const stepNode: Node = {
                id: stepNodeId,
                type: "step",
                position: getRelativePositionWithNodeId(
                  index % 2 === 0 ? "below" : "right",
                  planNodeId || prevId,
                  getNode,
                ),
                data: {
                  title: step.title,
                  content: step.content,
                  estimatedCost: step.hasCostsAssociated
                    ? step.estimatedCost
                    : 0,
                  estimatedTime: step.hasTimeAssociated
                    ? step.estimatedTime
                    : 0,
                  additionalTags: step.hasAdditionalTagsAssociated
                    ? step.additionalTags
                    : [],
                  imageUrl: imageUrls[index] || undefined,
                  tasks: step.tasks,
                },
              };
              setNodes((nodes) => nodes.concat(stepNode));
              setEdges((edges) =>
                edges.concat({
                  id: crypto.randomUUID(),
                  source: planNodeId || prevId,
                  target: stepNodeId,
                }),
              );
              prevId = stepNodeId;
            });
            addToolOutput({
              toolCallId,
              tool: toolName,
              output: {
                nodeIds: getNodes().filter((n) => n.type === "step").map((n) => n.id),
              },
              state: "output-available",
            });
          }
        }
        if (isStaticToolUIPart(part) && part.state === "output-available") {
          const toolName = getStaticToolName(part);
          const toolCallId = part.toolCallId;

          if (
            toolName === "createResearchNode" &&
            !processedToolCalls.current.has(toolCallId)
          ) {
            type PerformResearchOutput = {
              title: string;
              result: string;
              sources: {
                title: string;
                url: string;
                content: string;
              }[];
              sourceNodeIds?: string[];
            };
            const partOutput = part.output as PerformResearchOutput;
            const researchResultTitle = partOutput.title;
            const researchResult = partOutput.result;
            const researchSources = partOutput.sources;
            const sourceNodeIds = partOutput.sourceNodeIds || [];

            let position;
            if (sourceNodeIds)
              position = getRelativePositionWithNodeId(
                "right",
                sourceNodeIds[0],
                getNode,
              );
            else {
              position = screenToFlowPosition({
                x: getViewport().x * randFloat(0.8, 1.2) + randInt(-300, 300),
                y: getViewport().y * randFloat(0.3, 1.7) + randInt(-300, 300),
              });
            }

            const newNodeId = crypto.randomUUID();
            const newNode: Node = {
              id: newNodeId,
              type: "research",
              position: screenToFlowPosition({
                x: getViewport().x,
                y: getViewport().y,
              }),
              data: {
                title: researchResultTitle,
                content: researchResult,
                sources: researchSources,
                history: history,
                historyId: messages.findLast((m) => m.role === "user")?.id,
                historyEdgeIds: [],
              },
            };
            setNodes((nodes) => nodes.concat(newNode));
            const historyEdgeIds: string[] = [];
            sourceNodeIds.forEach((sourceNodeId) => {
              const newEdge: Edge = {
                id: crypto.randomUUID(),
                type: "custom",
                source: sourceNodeId,
                target: newNodeId,
                data: {
                  history: history,
                },
              };
              setEdges((edges) => edges.concat(newEdge));
              historyEdgeIds.push(newEdge.id);
            });
            updateNodeData(newNodeId, { ...newNode.data, historyEdgeIds });
            processedToolCalls.current.add(toolCallId);
          }

          if (
            toolName === "runSimulation" &&
            !processedToolCalls.current.has(toolCallId)
          ) {
            type RunSimulationOutput = {
              result: string;
            };
            const partOutput = part.output as RunSimulationOutput;
            const simulationResult = partOutput.result;

            let position = screenToFlowPosition({
              x: getViewport().x * randFloat(0.8, 1.2) + randInt(-300, 300),
              y: getViewport().y * randFloat(0.3, 1.7) + randInt(-300, 300),
            });

            const newNodeId = crypto.randomUUID();
            const newNode: Node = {
              id: newNodeId,
              type: "research",
              position: position,
              data: {
                title: "Simulation Result",
                content: simulationResult,
              },
            };
            setNodes((nodes) => nodes.concat(newNode));
            const planNodeId = getNodes().find((n) => n.type === "plan")?.id;
            if (planNodeId) {
              const newEdge: Edge = {
                id: crypto.randomUUID(),
                type: "custom",
                source: planNodeId,
                target: newNodeId,
                data: {
                  history: history,
                },
              };
              if (planNodeId) {
                setEdges((edges) => edges.concat(newEdge));
            }
            }
            processedToolCalls.current.add(toolCallId);
          }

          if (
            toolName === "createImages" &&
            !processedToolCalls.current.has(toolCallId)
          ) {
            type CreateImageOutput = {
              result: string;
              data: string[];
              coordResult?:
                | {
                    x: number;
                    y: number;
                    width: number;
                    height: number;
                  }[]
                | undefined;
            };
            console.log("Image position:", state.imagePosition);
            const partOutput = part.output as CreateImageOutput;

            const groupNodeId = crypto.randomUUID();

            const ImageNodes = partOutput.data.map((url, index) => {
              const ImageNode: Node = {
                id: toolCallId + "-" + index,
                type: "image",
                position: {
                  x:
                    partOutput.coordResult && partOutput.coordResult[index]
                      ? state.imagePosition
                        ? partOutput.coordResult[index].x +
                          state.imagePosition.x
                        : partOutput.coordResult[index].x
                      : state.imagePosition
                        ? state.imagePosition.x
                        : getViewport().x,
                  y:
                    partOutput.coordResult && partOutput.coordResult[index]
                      ? state.imagePosition
                        ? partOutput.coordResult[index].y +
                          state.imagePosition.y
                        : partOutput.coordResult[index].y
                      : state.imagePosition
                        ? state.imagePosition.y
                        : getViewport().y,
                },
                style: {
                  width:
                    partOutput.coordResult && partOutput.coordResult[index]
                      ? partOutput.coordResult[index].width
                      : state.imagePosition
                        ? state.imagePosition.width
                        : 200,
                  height:
                    partOutput.coordResult && partOutput.coordResult[index]
                      ? partOutput.coordResult[index].height
                      : state.imagePosition
                        ? state.imagePosition.height
                        : 200,
                },
                data: {
                  url: url,
                },
              };
              return ImageNode;
            });
            // const ImageNode = {
            //   id: toolCallId,
            //   type: "image",
            //   position: {
            //     x: state.imagePosition ? state.imagePosition.x : getViewport().x,
            //     y: state.imagePosition ? state.imagePosition.y : getViewport().y,
            //   },
            //   style: {
            //     width: state.imagePosition ? state.imagePosition.width : 200,
            //     height: state.imagePosition ? state.imagePosition.height : 200,
            //   },
            //   // className: `!w-[${state.imagePosition ? state.imagePosition.width : 200}px] !h-[${state.imagePosition ? state.imagePosition.height : 200}px]`,
            //   // position: screenToFlowPosition({
            //   //   x: state.imagePosition ? state.imagePosition.x : getViewport().x,
            //   //   y: state.imagePosition ? state.imagePosition.y : getViewport().y,
            //   // }),
            //   data: {
            //     url: (part.output as unknown as CreateImageOutput)
            //       .data,
            //   },
            // };
            setNodes((nodes) => nodes.concat(...ImageNodes));
            console.log("Added image node(s) to canvas:", ImageNodes);
            processedToolCalls.current.add(toolCallId);
          }
        }
      }),
    );
  }, [messages]);

  return (
    <>
      <StateContext value={{ state, setState }}>
        <ChatContext value={{ messages, sendMessage, setMessages }}>
          {children}
        </ChatContext>
      </StateContext>
    </>
  );
}
