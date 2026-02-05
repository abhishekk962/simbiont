"use client";

import { useEffect, useState } from "react";

export const BlurDottedBackground = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div>
      <div
        className="absolute inset-0 
                    bg-size-[40px_40px] 
                    bg-position-[-19px_-19px]"
        style={{
          backgroundColor: "#eeede9",
          backgroundImage: "radial-gradient(circle, #c4c4c4 1.5px, transparent 0)"
        }}
      ></div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          maskImage: `radial-gradient(circle 400px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0) 50%, rgb(255, 255, 255) 100%)`,
          WebkitMaskImage: `radial-gradient(circle 400px at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0) 50%, rgb(255, 255, 255) 100%)`,
          maskRepeat: "no-repeat",
          maskPosition: "0 0",
          backgroundColor: "#eeede9",
        }}
      ></div>
    </div>
  );
};