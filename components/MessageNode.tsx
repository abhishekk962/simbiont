"use client";

import { useCallback, useState, useMemo, useEffect, use } from "react";
import { Position, useReactFlow } from "@xyflow/react";
import { Textarea } from "@/components/ui/textarea";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
  BaseNodeFooter,
} from "@/components/ui/base-node";
import { BaseHandle } from "@/components/ui/base-handle";
import { GripHorizontal, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { useChat } from "@ai-sdk/react";
import { set } from "zod";
import { get } from "http";

export default function ElementNode({ id, type, data }: any) {
  const [messages, setMessages ] = useState(data.messages || []);

  useEffect(() => {
    setMessages(data.messages || []);
  }, [data.messages]);
  
  // return (
  //     <Button className="rounded-full flex flex-row items-center gap-1" variant={data.variant ?? "outline"} onClick={data.onClick}>{data.icon}{data.name}</Button>
  // );
  return (
    <>
        {messages}
    </>
  );
}
