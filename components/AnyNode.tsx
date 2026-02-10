"use client";

import { useEffect, useState } from "react";
import { Position, useReactFlow, type Node, type Edge } from "@xyflow/react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
} from "@/components/ui/base-node";
import { BaseHandle } from "@/components/ui/base-handle";
import { ChevronsDownUp, GripHorizontal, ListCollapse } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AnyNode({ id, type, data, selected }: any) {
  const [title, setTitle] = useState(data.title || "");
  const [content, setContent] = useState(data.content || "");
  const [nodesHidden, setNodesHidden] = useState<boolean>(false);
  const { updateNodeData, updateEdgeData, updateNode, getNodes } =
    useReactFlow();
  const {
    setNodes,
    setEdges,
    getNode,
    getEdge,
    getNodeConnections,
    updateEdge,
  } = useReactFlow();

  useEffect(() => {
    setTitle(data.title || "");
    setContent(data.content || "");
    updateNodeData(data.historyId, { history: data.history });
  }, [data]);

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

  const handleClickCollapse = () => {
    setNodesHidden(!nodesHidden);

    if (!nodesHidden) {
      const visitedNodes = new Set<string>();

      treeTraverseAndCollect(id);

      getNodes().forEach((node) => {
        updateNode(node.id, { hidden: true });
      });

      visitedNodes.forEach((nodeId) => {
        updateNode(nodeId, { hidden: false });
      });

      updateNode(id, { hidden: false });

      function treeTraverseAndCollect(source: string) {
        getNodeConnections({ nodeId: source, type: "target" }).forEach(
          ({ source }) => {
            visitedNodes.add(source);
            treeTraverseAndCollect(source);
          },
        );
      }
    } else {
      getNodes().forEach((node) => {
        updateNode(node.id, { hidden: false });
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 cursor-default">
      <BaseNode className={`${selected ? "border-black border-2" : ""}`}>
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
          <Button
            variant="ghost"
            size="icon-sm"
            className="dragHandle"
            onClick={handleClickCollapse}
          >
            <ChevronsDownUp size={16} />
          </Button>
          <Button variant="ghost" size="icon-sm" className="dragHandle">
            <GripHorizontal size={16} />
          </Button>
        </BaseNodeHeader>
        <BaseNodeContent>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              updateNodeData(id, { ...data, content: e.target.value });
            }}
            className="field-sizing-content resize-none max-h-[20lh] min-h-[5lh] w-64 nowheel nodrag border-none outline-none user-select-text"
            placeholder="Description"
            spellCheck={false}
          />
        </BaseNodeContent>
        <BaseHandle type="source" position={Position.Right} id="source" />
        <BaseHandle type="target" position={Position.Left} id="target" />
      </BaseNode>
    </div>
  );
}
