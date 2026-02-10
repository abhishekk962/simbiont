"use client";
import { memo } from 'react';

import { useState, useEffect } from "react";

const DrawingNode = ({ id, type, data, selected }: any) => {
  const [element, setElement ] = useState(data.element || []);

  useEffect(() => {
    setElement(data.element || []);
  }, [data.element]);
  
  return (
    <>
      <svg height={element.props.height} width={element.props.width} viewBox={element.props.viewBox} className={selected ? "stroke-blue-500 stroke-2" : "stroke-black"}>
        {element.props.children}
      </svg>
    </>
  );
}
export default DrawingNode;
// export default memo(DrawingNode);