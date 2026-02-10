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
import { ArrowUp } from "lucide-react";

export default function QuestionNode({ id, type, data, selected }: any) {
  const [input, setInput] = useState(data.input || "");

  const {
    setNodes,
  } = useReactFlow();

    const inputElement: HTMLTextAreaElement | HTMLInputElement | null =
    document.getElementById(`question-${id}`) as
      | HTMLTextAreaElement
      | HTMLInputElement
      | null;

    useEffect(() => {
    inputElement?.focus();
    const length = inputElement?.value.length || 0;
    inputElement?.setSelectionRange(length, length);
  }, [inputElement]);

  const handleSubmit = () => {
    data.addToolOutput({
      toolCallId: data.toolCallId,
      tool: data.tool,
      output: {
        answer: input,
      },
      state: "output-available",
    });
    setNodes((nodes) => nodes.filter((node) => node.id !== id));
  };
  return (
    <BaseNode
      className={`shadow-lg border border-gray-200 w-64 rounded-lg p-4`}
    >
      {data.question}
      <InputGroup
        className={`mt-2 ${input.length > 0 ? "rounded-lg" : "rounded-full"}`}
      >
        {input.length > 0 ? (
          <InputGroupTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={handleSubmit}
            id={`question-${id}`}
          />
        ) : (
          <InputGroupInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={handleSubmit}
            id={`question-${id}`}
          />
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
  );
}
