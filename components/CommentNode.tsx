"use client";

import { useState, useContext, useEffect, use, useRef, useMemo } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { ArrowUp, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CommentNode({ id, data, type, selected }: any) {
  const [savedComment, setSavedComment] = useState(false);

  const commentElement = document.getElementById(`prompt-input-${id}`);

  const [showComment, setShowComment] = useState(true);

  const [input, setInput] = useState("");

  useEffect(() => {
    commentElement?.focus();
  }, [commentElement]);

  useEffect(() => {
    if (selected) setSavedComment(false);
    else setSavedComment(true);
  }, [selected]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        setSavedComment(true);
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [savedComment]);

  return (
    <div className="flex flex-row gap-2" onMouseEnter={() => { if (savedComment) setShowComment(true) }}
        onMouseLeave={() => { if (savedComment) setShowComment(false) }}>
      <Button
        className="rounded-t-full rounded-r-full text-slate-500 bg-white shadow-lg border border-gray-200 p-0"
        variant="ghost"
        size="icon-lg"
        
        onClick={() => {setSavedComment(!savedComment); commentElement?.focus();}}
      >
        <MessageCircle size={32} strokeWidth={2} />
      </Button>
      {showComment && (
        <InputGroup className="rounded-full shadow-lg border border-gray-200 w-64 bg-white">
          <InputGroupInput
            placeholder="Comment..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onSubmit={() => setSavedComment(true)}
            id={`prompt-input-${id}`}
            disabled={savedComment}
          />
          {!savedComment && (
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="secondary"
                className="rounded-full"
                onClick={() => setSavedComment(true)}
              >
                <ArrowUp />
              </InputGroupButton>
            </InputGroupAddon>
          )}
        </InputGroup>
      )}
    </div>
  );
}
