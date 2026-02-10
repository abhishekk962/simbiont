"use client";

import { useEffect, useState } from "react";
import { Position, useReactFlow, type Node, type Edge } from "@xyflow/react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
} from "@/components/ui/base-node";
import { BaseHandle } from "@/components/ui/base-handle";
import { GripHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import Markdown from "react-markdown";
import remarkGfm from 'remark-gfm'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"


export default function ResearchNode({ id, type, data, selected }: any) {
  const [title, setTitle] = useState(data.title || "");
  const [content, setContent] = useState(data.content || "");
  const { updateNodeData, updateEdgeData } = useReactFlow();
  const { setNodes, setEdges, getNode, getEdge } = useReactFlow();

  useEffect(() => {
    setTitle(data.title || "");
    setContent(data.content || "");
    updateNodeData(data.historyId, { history: data.history });
  }, [data]);

  useEffect(() => {
    console.log("Content updated:", JSON.stringify(data.content));
  }, []);

  useEffect(() => {
    if (data.historyEdgeIds?.length) {
      data.historyEdgeIds.forEach((edgeId: string) => {
        const historyEdge = getEdge(edgeId);
        if (historyEdge) {
          updateEdgeData(historyEdge.id, { history: data.history });
        }
      });
    }
  }, [data.history]);

  return (
    <div className="flex flex-col items-center gap-2 cursor-default">
      <BaseNode className={`${selected ? "border-black border-2" : ""} w-lg`}>
        <BaseNodeHeader>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              updateNodeData(id, { ...data, title: e.target.value });
            }}
            className="font-semibold bg-transparent border-none outline-none user-select-text"
            placeholder="Block"
            spellCheck={false}
          />
          <Button variant="ghost" size="icon-sm" className="dragHandle">
            <GripHorizontal size={16} />
          </Button>
        </BaseNodeHeader>
        <BaseNodeContent>
          <Markdown remarkPlugins={[remarkGfm]}
            components={{
              // Map `h1` (`# heading`) to use `b`s.
              h1: ({ node, ...props }) => (
                <span
                  {...props} className="font-black text-2xl"
                />
              ),
              h2: ({ node, ...props }) => (
                <span
                  {...props} className="font-extrabold text-xl"
                />
              ),
              h3: ({ node, ...props }) => (
                <span
                  {...props} className="font-bold text-lg"
                />
              ),
              h4: ({ node, ...props }) => (
                <span
                  {...props} className="font-semibold text-base"
                />
              ),
              h5: ({ node, ...props }) => (
                <span
                  {...props} className="font-medium"
                />
              ),
              h6: ({ node, ...props }) => (
                <span
                  {...props} className="font-light"
                />
              ),
              strong: ({ node, ...props }) => (
                <span
                  {...props} className="font-bold"
                />
              ),
              table: Table,
              thead: TableHeader,
              tbody: TableBody,
              tfoot: TableFooter,
              tr: TableRow,
              th: TableHead,
              td: TableCell,
            }}
          >
            {content}
          </Markdown>
          {/* <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              updateNodeData(id, { ...data, content: e.target.value });
            }}
            className="field-sizing-content resize-none max-h-[20lh] min-h-[5lh] w-64 nowheel nodrag border-none outline-none user-select-text"
            placeholder="Description"
            spellCheck={false}
          /> */}
        </BaseNodeContent>
        <BaseHandle type="source" position={Position.Right} id="source" />
        <BaseHandle type="target" position={Position.Left} id="target" />
      </BaseNode>
    </div>
  );
}
