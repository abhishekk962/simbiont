"use client";

import type { Node } from "@xyflow/react";

export const handleUpload = ({
  setNodes, callback,
}: {
  setNodes: React.Dispatch<React.SetStateAction<Node[]>>;
  callback?: () => void;
}) => {
  // open a file dialog
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.multiple = true;
  input.onchange = (e) => {
    const files = (e.target as HTMLInputElement).files;
    if (files) {
      const fileArray = Array.from(files);
      setNodes((nodes) => [
        ...nodes,
        ...fileArray.map((file, index) => ({
          id: "upload-" + index,
          type: "image",
          position: { x: 400 + index * 220, y: 0 },
          data: { url: URL.createObjectURL(file) },
        })),
      ]);
    }
  };
  input.click();
  callback?.();
};
