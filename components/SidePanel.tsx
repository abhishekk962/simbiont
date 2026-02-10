"use client";

import { Button } from "@/components/ui/button";
import {
  CirclePlusIcon,
  Images,
  MessageCircle,
  PlusIcon,
  RotateCcw,
  PencilLine,
  Upload,
} from "lucide-react";
import { useReactFlow } from "@xyflow/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MediaLibrary from "@/components/MediaLibrary";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { set } from "zod";
import Draw from "@/components/Draw";
import { handleUpload } from "./handleUpload";

export default function SidePanel({
  isDrawingMode,
  setIsDrawingMode,
}: {
  isDrawingMode: boolean;
  setIsDrawingMode: (val: boolean) => void;
}) {
  const { setNodes, screenToFlowPosition, getNodes } = useReactFlow();

  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [isCommentMode, setIsCommentMode] = useState(false);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!isCommentMode) return;

    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    const handleClick = (e: MouseEvent) => {
      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      console.log(
        "Click position:",
        { x: e.clientX, y: e.clientY },
        "Flow position:",
        flowPos,
      );
      setNodes((nds) => [
        ...nds,
        {
          id: "comment-" + (getNodes().length + 1).toString(),
          type: "comment",
          position: flowPos,
          dragHandle: ".dragHandle",
          data: {},
          origin: [0, 1],
          selected: true,
        },
      ]);
      setIsCommentMode(false);
      e.preventDefault();
      e.stopPropagation();
      setCursorPosition({ x: 0, y: 0 });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick, { capture: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick, { capture: true });
    };
  }, [isCommentMode, screenToFlowPosition]);

  const handleNewNode = () => {
    setNodes((nds) => [
      ...nds,
      {
        id: (nds.length + 1).toString(),
        type: "any",
        position: screenToFlowPosition({ x: 300, y: 300 }),
        dragHandle: ".dragHandle",
        data: {},
      },
    ]);
  };

  return (
    <>
      <div
        className={`absolute top-1/2 -translate-y-1/2 h-fit left-5 rounded-full flex flex-col p-2 gap-2 bg-white shadow-lg border border-gray-200 ${isDrawingMode ? "z-10" : "z-0"}`}
      >
        <Button
          className="rounded-full text-slate-500"
          variant="ghost"
          size="icon-lg"
          onClick={handleNewNode}
        >
          <CirclePlusIcon size={32} strokeWidth={2} />
        </Button>
        <Button
          className="rounded-full text-slate-500"
          variant="ghost"
          size="icon-lg"
          onClick={(e) => {
            e.stopPropagation();
            setIsCommentMode(true);
          }}
        >
          <MessageCircle size={32} strokeWidth={2} />
        </Button>
        <Button
          className={`rounded-full text-slate-500 ${isDrawingMode ? "bg-gray-200" : ""}`}
          variant="ghost"
          size="icon-lg"
          onClick={() => setIsDrawingMode(!isDrawingMode)}
        >
          <PencilLine size={32} strokeWidth={2} />
        </Button>
        {isDrawingMode && createPortal(<Draw className="z-5" />, document.body)}
        <Dialog
          modal={false}
          open={mediaLibraryOpen}
          onOpenChange={setMediaLibraryOpen}
        >
          <DialogTrigger asChild>
            <Button
              className="rounded-full text-slate-500"
              variant="ghost"
              size="icon-lg"
            >
              <Images size={32} strokeWidth={2} />
            </Button>
          </DialogTrigger>
          <MediaLibrary onSelectImage={() => setMediaLibraryOpen(false)} />
        </Dialog>
        <Button
          variant="ghost"
          size="icon-lg"
          className="rounded-full text-slate-500"
          onClick={() => handleUpload({ setNodes})}
        >
          <Upload size={32} strokeWidth={2} />
        </Button>
        <Button
          variant="ghost"
          size="icon-lg"
          className="rounded-full text-slate-500"
          onClick={() => window.location.reload()}
        >
          <RotateCcw size={32} strokeWidth={2} />
        </Button>
      </div>
      {isCommentMode &&
        createPortal(
          <div
            className="fixed pointer-events-none z-9999 rounded-t-full rounded-r-full bg-white shadow-lg border border-gray-200 p-0 translate-x-[50%] translate-y-[-50%]"
            style={{
              left: cursorPosition.x,
              top: cursorPosition.y,
              transform: "translate(-50%, -50%)",
            }}
          >
            <Button
              className="rounded-full text-slate-500"
              variant="ghost"
              size="icon-lg"
            >
              <MessageCircle size={32} strokeWidth={2} />
            </Button>
          </div>,
          document.body,
        )}
    </>
  );
}
