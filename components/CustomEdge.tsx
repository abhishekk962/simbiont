"use client";

import React from "react";
import { getBezierPath, EdgeLabelRenderer, BaseEdge } from "@xyflow/react";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { History } from "lucide-react";


const CustomEdge = ({ id, data, style, ...props }: any) => {
  const [edgePath, labelX, labelY] = getBezierPath(props);

  const [history, setHistory] = useState<string[]>(data.history || []);

  useEffect(() => {
    setHistory(data.history || []);
  }, [data]);

  const [hovered, setHovered] = useState(false);

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            background: "white",
            padding: 5,
            fontSize: 14,
            pointerEvents: "all",
            maxWidth: 200,
          }}
          className="nodrag nopan hover:bg-sky-700 rounded-full hover:rounded-sm"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          {/* {history.map((entry) => entry.toString()).join(", ")} */}
          {hovered ? (
            <div className="max-h-48 overflow-y-auto">
              <strong>History</strong>
              {history.map((item, index) => (
                <div key={crypto.randomUUID()}>
                  <div key={crypto.randomUUID()}>{item}</div>
                  {index < history.length - 1 && <hr key={crypto.randomUUID()} className="mt-2"/>}
                </div>
              ))}
            </div>
          ) : <History size={16}/>}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default CustomEdge;
