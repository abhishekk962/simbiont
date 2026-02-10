"use client";

import { Position, NodeResizeControl } from "@xyflow/react";
import { BaseNode } from "@/components/ui/base-node";
import { BaseHandle } from "@/components/ui/base-handle";
import { MoveDiagonal2 } from "lucide-react";

export default function ImageNode({ id, type, data, selected }: any) {
  const controlStyle = {
    background: "transparent",
    border: "none",
  };

  return (
    <BaseNode className={`${selected ? "border-primary" : ""}`}>
      {selected && (
        <NodeResizeControl style={controlStyle} minWidth={10} maxWidth={400}>
          <MoveDiagonal2 className="text-gray-500" />
        </NodeResizeControl>
      )}
      <img
        src={data.url}
        alt={data.alt}
        className="w-full h-auto object-cover rounded-sm"
      />
      <BaseHandle type="target" position={Position.Left} id="target" />
      <BaseHandle type="source" position={Position.Right} id="source" />
    </BaseNode>
  );
}
