"use client";

import { useEffect } from "react";
import { type Node, Position, useReactFlow } from "@xyflow/react";
import {
  Lightbulb,
  MessageSquareMore,
  PencilLine,
  Sparkles,
  SquareMousePointer,
  Upload,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Typewriter from "typewriter-effect";
import { ButtonGroup } from "./ui/button-group";
import { handleUpload } from "./handleUpload";

export default function InitialButtons({
  onButtonClick,
  setIsDrawingMode,
  resetCanvas,
}: {
  onButtonClick: () => void;
  setIsDrawingMode: (val: boolean) => void;
  resetCanvas?: () => void;
}) {
  const { setNodes, fitView, updateNodeData } = useReactFlow();

  const handleAskClick = () => {
    setNodes(() => [
      {
        id: "initial",
        type: "prompt",
        position: { x: 200, y: 0 },
        data: {},
      },
    ]);
    fitView({ duration: 1000 });
    onButtonClick();
  };

  const handleGenerateImagesClick = () => {
    setNodes(() => [
      {
        id: "initial",
        type: "prompt",
        position: { x: 200, y: 0 },
        data: { input: "Generate some images for ..." },
      },
    ]);
    fitView({ duration: 1000 });
    onButtonClick();
  };

  const handleUploadClick = () => {
    handleUpload({
      setNodes,
      callback: () => {
        setNodes(() => []);
        fitView({ duration: 1000 });
        onButtonClick();
      },
    });
  };

  const handleNodeClick = () => {
    setNodes(() => [
      {
        id: "1",
        type: "any",
        position: { x: 600, y: -60 },
        data: { data: "Start with a blank node", type: "node" },
      },
    ]);
    fitView();
    onButtonClick();
  };

  const handleSketchClick = () => {
    setNodes(() => []);
    setIsDrawingMode(true);
    onButtonClick();
  };

  useEffect(() => {
    setNodes((nodes) => nodes.filter((node) => node.id !== "button"));
  }, []);

  const textNode: Node = {
    id: "1",
    type: "element",
    position: { x: 520, y: -40 },
    data: {
      element: (
        <div className="max-w-lg text-center">
          <Typewriter
            onInit={(typewriter) => {
              typewriter
                .typeString(
                  "Turn your idea into a whole plan your team can execute or start with...",
                )
                .start();
            }}
            options={{
              autoStart: true,
              loop: false,
              delay: 20,
            }}
          />
        </div>
      ),
    },
  };

  const buttonNode: Node = {
    id: "button",
    type: "element",
    position: { x: 0, y: 0 },
    data: {
      elements: [],
    },
    draggable: false,
    selectable: true,
  };

  useEffect(() => {
    setNodes([buttonNode]);
    updateNodeData("button", {
      element: (
        <div className="flex flex-col items-center">
          <div className="max-w-lg text-center mb-4">
            <Typewriter
              onInit={(typewriter) => {
                typewriter
                  .typeString(
                    "Turn your idea into a whole plan your team can execute or start with...",
                  )
                  .start();
              }}
              options={{
                autoStart: true,
                loop: false,
                delay: 20,
              }}
            />
          </div>
          <ButtonGroup className="gap-2">
            <ButtonGroup>
              <Button
                onClick={handleAskClick}
                variant="outline"
                className="rounded-full"
              >
                <MessageSquareMore /> Ask simbiont
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button
                onClick={handleUploadClick}
                variant="outline"
                className="rounded-full"
              >
                <Upload /> Upload inspiration
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button
                onClick={handleGenerateImagesClick}
                variant="outline"
                className="rounded-full"
              >
                <Sparkles /> Generate images
              </Button>
            </ButtonGroup>
            <ButtonGroup>
              <Button
                onClick={handleSketchClick}
                variant="outline"
                className="rounded-full"
              >
                <PencilLine /> Sketch it out
              </Button>
            </ButtonGroup>
            {/* <ButtonGroup>
              <Button
                onClick={handleNodeClick}
                variant="outline"
                className="rounded-full"
              >
                <SquareMousePointer /> Start with a blank node
              </Button>
            </ButtonGroup> */}
          </ButtonGroup>
        </div>
      ),
    });
    fitView({ duration: 1000, padding: 1 });
  }, []);

  return <></>;
}
