"use client";

import { StateContext } from "@/components/StateContext";
import { UIMessage } from "@ai-sdk/react";
import {
  UIDataTypes,
  UITools,
  getStaticToolName,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "ai";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { mergeTags } from "@/lib/utils";
import { DefaultChatTransport, isStaticToolUIPart, isTextUIPart } from "ai";

import { toast } from "sonner";
import { State } from "@/lib/state";
import React, {
  use,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type Node,
  type Edge,
  type OnConnect,
  type NodeChange,
  ReactFlow,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
  getIncomers,
} from "@xyflow/react";
import TopLeftPanel from "@/components/TopLeftPanel";
import ShortcutGuide from "@/components/ShortcutGuide";
import SidePanel from "@/components/SidePanel";
import { Button } from "@/components/ui/button";
import {
  initialEdges,
  initialNodes,
  nodeTypes,
  getRelativePositionWithNodeId,
  edgeTypes,
} from "@/lib/nodesEdges";
import { id, vi } from "zod/v4/locales";
import { any, set } from "zod";
import { Lightbulb, MessageSquareMore, Workflow } from "lucide-react";
import InitialButtons from "@/components/InitialButtons";
import { ChatContext } from "@/components/ChatContext";
import { useChat } from "@ai-sdk/react";
import { title } from "process";
import { get } from "http";
import { resolveCollisions } from "@/lib/resolveCollisions";
import { stat } from "fs";
import { NodeController } from "@/components/NodeController";
import { Chat } from "@/components/Chat";

function CanvasPage({ panelVisible }: { panelVisible: boolean }) {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const {
    screenToFlowPosition,
    getNodes,
    updateEdge,
    getNodeConnections,
    getEdges,
  } = useReactFlow();
  const { state, setState } = useContext(StateContext);

  const onConnect: OnConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );
  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionState: any) => {
      // when a connection is dropped on the pane it's not valid
      if (!connectionState.isValid) {
        // we need to remove the wrapper bounds, in order to get the correct position
        const id = crypto.randomUUID();
        const { clientX, clientY } =
          "changedTouches" in event ? event.changedTouches[0] : event;

        let origin: [number, number];
        let sourceNodeId: string;
        let targetNodeId: string;

        if (connectionState?.fromHandle.type === "source") {
          origin = [0.0, 0.5] as [number, number];
          sourceNodeId = connectionState.fromNode.id;
          targetNodeId = id;
        } else {
          origin = [1.0, 0.5] as [number, number];
          sourceNodeId = id;
          targetNodeId = connectionState.fromNode.id;
        }
        const newNode = {
          id,
          type: "any",
          position: screenToFlowPosition({
            x: clientX,
            y: clientY,
          }),
          dragHandle: ".dragHandle",
          data: {},
          origin,
        };
        setNodes((nds) => nds.concat(newNode));
        setEdges((eds) =>
          eds.concat({ id, target: targetNodeId, source: sourceNodeId }),
        );
      }
    },
    [screenToFlowPosition],
  );

  const onNodeDragStop = useCallback(() => {
    setNodes((nds) => [
      ...resolveCollisions(
        nds.filter(
          (nd) =>
            nd.type !== "drawing" &&
            nd.type !== "prompt" &&
            nd.type !== "comment" &&
            nd.type !== "group",
        ),
        {
          maxIterations: Infinity,
          overlapThreshold: 0.5,
          margin: 15,
        },
      ),
      ...nds.filter(
        (nd) =>
          nd.type === "drawing" ||
          nd.type === "prompt" ||
          nd.type === "comment" ||
          nd.type === "group",
      ),
    ]);
  }, [setNodes]);

  const onNodesChangeNew = useCallback(
    (changes: NodeChange<Node>[]) => {
      onNodesChange(changes);
      setState((state) => ({
        ...state,
        selectedNodeIds: getNodes()
          .filter((node) => node.selected)
          .map((node) => node.id),
      }));
      getEdges().forEach((edge) => {
        updateEdge(edge.id, {
          animated: false,
          style: { stroke: "#c4c4c4", strokeWidth: 3 },
        });
      });
      getNodes()
        .filter((node) => node.selected)
        .forEach(({ id }) => {
            treeTraverseAndAnimate(id);

            function treeTraverseAndAnimate(source: string) {
              getNodeConnections({ nodeId: source, type: "target" }).forEach(({ edgeId, source }) => {
                updateEdge(edgeId, { animated: true, style: { stroke: "#121212", strokeWidth: 3 } });
                treeTraverseAndAnimate(source);
              });
            }
        });
      setNodes((nds) => [
        ...resolveCollisions(
          nds.filter(
            (nd) =>
              nd.type !== "drawing" &&
              nd.type !== "prompt" &&
              nd.type !== "comment" &&
              nd.type !== "group",
          ),
          {
            maxIterations: Infinity,
            overlapThreshold: 0.5,
            margin: 15,
          },
        ),
        ...nds.filter(
          (nd) =>
            nd.type === "drawing" ||
            nd.type === "prompt" ||
            nd.type === "comment" ||
            nd.type === "group",
        ),
      ]);
    },
    [setNodes],
  );

  const onContextMenu = useCallback((event: any) => {
    event.preventDefault();
    setNodes((nodes) => nodes.filter((node) => node.type !== "prompt"));

    setNodes((nodes) => [
      ...nodes,
      {
        id: crypto.randomUUID(),
        type: "prompt",
        position: screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        }),
        data: { size: "small" },
        origin: [0.5, 0.5],
        selectable: false,
        className: "z-1001!",
      },
    ]);
  }, []);

  const onPaneClick = useCallback((event: React.MouseEvent) => {
    setNodes((nodes) => nodes.filter((node) => node.type !== "prompt"));
  }, []);

  return (
    <div
      style={{ width: "100vw", height: "100vh" }}
      className="wrapper"
      ref={reactFlowWrapper}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChangeNew}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={onNodeDragStop}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        onNodeContextMenu={onContextMenu}
        onPaneContextMenu={onContextMenu}
        onSelectionContextMenu={onContextMenu}
        defaultEdgeOptions={{style: { stroke: "#c4c4c4", strokeWidth: 3 }}}
        onPaneClick={onPaneClick}
        fitView
        fitViewOptions={{ padding: 1, duration: 1000, interpolate: "smooth" }}
      >
        <Panel position="top-right" className="select-none">
          {panelVisible && <ShortcutGuide />}
        </Panel>
        {/* <Panel position="center-left"></Panel> */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={12}
          size={1.5}
          color="#c4c4c4"
          bgColor="#eeede9"
        />
      </ReactFlow>

      <TopLeftPanel />
    </div>
  );
}

export default function Page() {
  const [panelVisible, setPanelVisible] = useState(false);
  const [isDrawingMode, setIsDrawingMode] = useState(false);

  const handleButtonClick = () => {
    setPanelVisible(!panelVisible);
  };

  return (
    <ReactFlowProvider>
      <InitialButtons
        onButtonClick={handleButtonClick}
        setIsDrawingMode={setIsDrawingMode}
      />
      <Chat>
        <CanvasPage panelVisible={panelVisible} />
        {panelVisible && (
          <SidePanel
            isDrawingMode={isDrawingMode}
            setIsDrawingMode={setIsDrawingMode}
          />
        )}
        <NodeController />
      </Chat>
    </ReactFlowProvider>
  );
}
