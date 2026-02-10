"use client";

import * as React from "react";
import { getStroke } from "perfect-freehand";
import { set } from "zod";
import { useReactFlow } from "@xyflow/react";
// import "./styles.css";

// Turn the points returned from perfect-freehand into SVG path data.

export function getSvgPathFromStroke(stroke: number[][]) {
  if (!stroke.length) return "";

  const d = stroke.reduce(
    (acc, [x0, y0], i, arr) => {
      const [x1, y1] = arr[(i + 1) % arr.length];
      acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
      return acc;
    },
    ["M", ...stroke[0], "Q"],
  );

  d.push("Z");
  return d.join(" ");
}

const options = {
  size: 8,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  easing: (t: any) => t,
  start: {
    taper: 0,
    easing: (t: any) => t,
    cap: true,
  },
  end: {
    taper: 20,
    easing: (t: any) => t,
    cap: true,
  },
};

export default function Example({ className }: { className?: string }) {
  const [points, setPoints] = React.useState<any>([]);
  const [savedPoints, setSavedPoints] = React.useState<any[]>([]);

  const { setNodes, screenToFlowPosition } = useReactFlow();

  function handlePointerDown(e: any) {
    e.target.setPointerCapture(e.pointerId);
    setPoints([[e.pageX, e.pageY, e.pressure]]);
  }

  function handlePointerMove(e: any) {
    if (e.buttons !== 1) return;
    setPoints([...points, [e.pageX, e.pageY, e.pressure]]);
  }

  function handlePointerUp(e: any) {
    e.target.releasePointerCapture(e.pointerId);
    setSavedPoints([...savedPoints, points]);
    setPoints([]);
    // console.log("Final points:", points);
    const flowPoints = points.map((p: any) => {
      const { x, y } = screenToFlowPosition({ x: p[0], y: p[1] });
      return [x, y, p[2]];
    });

    const xs = flowPoints.map((p: any) => p[0]);
    const ys = flowPoints.map((p: any) => p[1]);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    const pad = options.size;
    const width = maxX - minX + pad * 2;
    const height = maxY - minY + pad * 2;

    const flowStroke = getStroke(flowPoints, options);
    const flowPathData = getSvgPathFromStroke(flowStroke as any);

    setNodes((nds) => [
      ...nds,
      {
        id: crypto.randomUUID(),
        type: "drawing",
        position: { x: minX - pad, y: minY - pad },
        data: {
          element: (
            <svg
              width={width}
              height={height}
              viewBox={`${minX - pad} ${minY - pad} ${width} ${height}`}
            >
              <path d={flowPathData} />
            </svg>
          ),
        },
      },
    ]);
  }

  const stroke = getStroke(points, options);
  const pathData = getSvgPathFromStroke(stroke as any);

  return (
    <div className={className}>
      <svg
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="touch-action-none w-screen h-screen absolute top-0 left-0"
      >
        {points && <path d={pathData} />}
      </svg>
      {savedPoints.map((pts, i) => {
        const stroke = getStroke(pts, options);
        const pathData = getSvgPathFromStroke(stroke as any);
        return (
          <svg
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            className="touch-action-none w-screen h-screen absolute top-0 left-0"
            key={i}
          >
            <path key={i} d={pathData} />
          </svg>
        );
      })}
    </div>
  );
}
