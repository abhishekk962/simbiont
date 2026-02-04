"use client";

import { useRef } from "react";
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  BackgroundVariant,
  Background,
} from "@xyflow/react";

function CanvasComponent() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      className="wrapper"
      ref={reactFlowWrapper}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        fitView
        fitViewOptions={{ padding: 1, duration: 1000, interpolate: "smooth" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1.5}
          color="#c4c4c4"
          bgColor="#eeede9"
        />
      </ReactFlow>
    </div>
  );
}

export default function Main() {
  return (
    <ReactFlowProvider>
      <CanvasComponent />
    </ReactFlowProvider>
  );
}
