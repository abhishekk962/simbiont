"use client";

import { StateContext } from "@/components/StateContext";
import { use, useContext, useEffect, useRef } from "react";
import { useReactFlow } from "@xyflow/react";
import { set } from "zod";
import { get } from "http";
import { stat } from "fs";
import { useViewport } from "@xyflow/react";

export function NodeController() {
  const { state, setState } = useContext(StateContext);
  const {
    setNodes,
    fitView,
    getNodes,
    updateNodeData,
    updateNode,
    setEdges,
    screenToFlowPosition,
  } = useReactFlow();

  // useEffect(() => {
  //   const handler = (event: MouseEvent) => {
  //     if (event.altKey) {
  //       event.preventDefault();
  //       setNodes((nodes) => nodes.filter((node) => node.type !== "prompt"));

  //       setNodes((nodes) => [
  //         ...nodes,
  //         {
  //           id: crypto.randomUUID(),
  //           type: "prompt",
  //           position: screenToFlowPosition({
  //             x: event.clientX,
  //             y: event.clientY,
  //           }),
  //           data: { size: "small" },
  //           origin: [0.5, 0.5],
  //           selected: true,
  //         },
  //       ]);
  //     }
  //   };

  //   window.addEventListener("click", handler);

  //   return () => window.removeEventListener("click", handler);
  // }, []);

  return <></>;
}
