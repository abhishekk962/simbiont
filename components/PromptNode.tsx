"use client";

import {
  useState,
  useContext,
  useEffect,
  use,
  useRef,
  useMemo,
  useCallback,
} from "react";
import {
  Position,
  useReactFlow,
  useViewport,
  getViewportForBounds,
} from "@xyflow/react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
  BaseNodeFooter,
} from "@/components/ui/base-node";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Badge } from "@/components/ui/badge";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { BaseHandle } from "@/components/ui/base-handle";
import { GripHorizontal, ArrowUp, X, HeartIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toTitleCase } from "@/lib/utils";
import { UIMessage } from "@ai-sdk/react";
import { UIDataTypes, UITools, FileUIPart } from "ai";
import { StateContext } from "@/components/StateContext";
import { ChatContext } from "@/components/ChatContext";
import { clsx } from "clsx";
import { stat } from "fs";
import { toast } from "sonner";
import { toJpeg, toPng } from "html-to-image";
import { url } from "inspector";
import type { PutBlobResult } from "@vercel/blob";
import { no } from "zod/v4/locales";

export const promptSuggestions = [
  "Give me 3 ideas for a cookie sale",
  "Give me ideas about an ad campaign",
  "Give me ways to improve customer engagement",
];

export default function PromptNode({
  id,
  type,
  data,
  position,
  selected,
}: any) {
  const {
    setNodes,
    getNodes,
    setEdges,
    getNodesBounds,
    getViewport,
    getNode,
    getNodeConnections,
  } = useReactFlow();
  const { state, setState } = useContext(StateContext);
  const { messages, sendMessage, setMessages } = useContext(ChatContext);
  const [input, setInput] = useState(data.input || "");
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [files, setFiles] = useState<string[] | undefined>(undefined);
  const [imageDims, setImageDims] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleSubmit = () => {
    setNodes((nodes) => nodes.filter((node) => node.type !== "prompt"));

    const selectedNodes = getNodes().filter(
      (node) => node.selected && node.type !== "prompt",
    );
    const selectedNodeIds = selectedNodes.map((node) => node.id);

    const messageParts =
      files && files.length > 0
        ? [
            { type: "text", text: input },
            {
              type: "text",
              text: `The size of the attached reference image is ${Math.round(imageDims?.width || 0)}x${Math.round(imageDims?.height || 0)}`,
            },
            ...files.map(
              (file) =>
                ({
                  type: "file",
                  mediaType: "image/jpeg",
                  filename: "canvas-image.jpg",
                  url: file,
                }) as FileUIPart,
            ),
          ]
        : [{ type: "text", text: input }];
    sendMessage({ parts: messageParts }, { body: { state } });
    setInput("");
    toast.loading("Thinking...", { id: "toastMessage" });
  };

  const inputElement: HTMLTextAreaElement | HTMLInputElement | null =
    document.getElementById(`prompt-input-${id}`) as
      | HTMLTextAreaElement
      | HTMLInputElement
      | null;

  useEffect(() => {
    inputElement?.focus();
    const length = inputElement?.value.length || 0;
    inputElement?.setSelectionRange(length, length);
  }, [inputElement]);

  const getSuggestions = useCallback((position: { x: number; y: number }) => {
    const nodeCoords = getNodes().map((node) => ({
      id: node.id,
      x: node.position.x,
      y: node.position.y,
    }));
    const closestNode = nodeCoords.reduce(
      (closest, node) => {
        const distance = Math.hypot(node.x - position.x, node.y - position.y);
        const closestDistance = Math.hypot(
          closest.x - position.x,
          closest.y - position.y,
        );
        return distance < closestDistance && node.id !== id ? node : closest;
      },
      { id: "", x: Infinity, y: Infinity },
    );

    console.log("Closest node to prompt:", closestNode);

    if (closestNode.id === "") {
      console.log("No nearby nodes found for suggestions.");
      return Promise.resolve(promptSuggestions);
    }

    // check local storage for suggestions with key as node id
    const cachedSuggestions = localStorage.getItem(
      `suggestions-${closestNode.id}`,
    );
    if (cachedSuggestions) {
      console.log("Using cached suggestions for node:", closestNode.id);
      return Promise.resolve(JSON.parse(cachedSuggestions));
    }

    const closestNodeData = getNode(closestNode.id)?.data;

    return fetch("/api/suggestions", {
      method: "POST",
      body: JSON.stringify({
        prompt: JSON.stringify({ closestNodeData }),
      }),
    }).then((response) => {
      return response.json().then((json) => {
        // set suggestions in local storage with key as node id and value as suggestions
        localStorage.setItem(
          `suggestions-${closestNode.id}`,
          JSON.stringify(json.suggestions),
        );
        console.log(
          "Fetched suggestions for node:",
          closestNode.id,
          json.suggestions,
        );
        return json.suggestions;
      });
    });
  }, []);

  useEffect(() => {
    setSuggestions([]);
    getSuggestions(getNode(id)?.position || { x: 0, y: 0 }).then((fetchedSuggestions: string[]) => {
      if (fetchedSuggestions) {
        setSuggestions(fetchedSuggestions);
      }
    });
  }, []);

  useEffect(() => {
    console.log("Suggestions updated:", suggestions);
  }, [suggestions]);
  

  useEffect(() => {
    const selectedNodes = getNodes().filter(
      (node) => node.selected && node.type !== "prompt",
    );
    const selectedDrawingNodes = selectedNodes.filter(
      (node) => node.type === "drawing",
    );

    const selectedImageNodes = selectedNodes.filter((node) => node.type === "image");

    const svgs = selectedDrawingNodes.map((node) => node.data.element);

    console.log("Selected nodes:", selectedNodes);
    console.log("Selected drawing nodes:", selectedDrawingNodes);

    if (selectedImageNodes.length > 0) {
      selectedImageNodes.forEach((node) => {
        const imageUrl = node.data.url as string;
        setFiles([imageUrl]);
      });
    }

    if (selectedDrawingNodes.length > 0) {
      const nodesBounds = getNodesBounds(selectedDrawingNodes);

      const imageWidth = nodesBounds.width;
      const imageHeight = nodesBounds.height;
      const imageX = nodesBounds.x;
      const imageY = nodesBounds.y;
      const imagePosition = {
        x: imageX,
        y: imageY,
        width: imageWidth,
        height: imageHeight,
      };
      setState((state) => ({ ...state, imagePosition }));
      const viewport = getViewportForBounds(
        nodesBounds,
        imageWidth,
        imageHeight,
        0.5,
        2,
        0,
      );

      toJpeg(document.querySelector(".react-flow__viewport") as HTMLElement, {
        backgroundColor: "#1a365d",
        width: imageWidth,
        height: imageHeight,
        style: {
          width: imageWidth.toString() + "px",
          height: imageHeight.toString() + "px",
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        },
      }).then((dataUrl) => {
        setFiles([dataUrl]);
        setImageDims({ width: imageWidth, height: imageHeight });
      });
    }
  }, []);

  useEffect(() => {
    console.log("Image position set in state:", state.imagePosition);
  }, [state.imagePosition]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [input]);

  return (
    <div>
      <BaseNode
        className={`shadow-lg border border-gray-200 ${data.size === "small" ? "w-64" : "w-lg"} ${input.length > 0 ? "rounded-lg" : "rounded-full"}`}
      >
        <InputGroup
          className={`${input.length > 0 ? "rounded-lg" : "rounded-full"}`}
        >
          {input.length > 0 ? (
            <InputGroupTextarea
              placeholder="Ask Simbiont..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onSubmit={handleSubmit}
              id={`prompt-input-${id}`}
            />
          ) : (
            <InputGroupInput
              placeholder="Ask Simbiont..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onSubmit={handleSubmit}
              id={`prompt-input-${id}`}
            />
          )}
          {files && files.length > 0 && (
            <InputGroupAddon
              align={`${input.length > 0 ? "block-start" : "inline-start"}`}
            >
              <Badge onClick={() => setFiles(undefined)}>
                Selection <X />
              </Badge>
            </InputGroupAddon>
          )}
          <InputGroupAddon
            align={`${input.length > 0 ? "block-end" : "inline-end"}`}
          >
            <InputGroupButton
              variant="secondary"
              className="rounded-full ml-auto"
              onClick={handleSubmit}
            >
              <ArrowUp />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </BaseNode>
      {showSuggestions && (
          <div className="fixed mt-4 w-full flex flex-col gap-2">
            {suggestions.map(
              (suggestion: string, index: number) => (
                <Button
                  key={index}
                  className="rounded-full font-normal w-fit"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setInput(suggestion);
                    inputElement?.focus();
                    setShowSuggestions(false);
                  }}
                >
                  {suggestion}
                </Button>
              ),
            )}
          </div>
        )}
    </div>
  );
}
