"use client";

import { useCallback, useState, useMemo, useEffect, use } from "react";

export default function ElementNode({ id, type, data }: any) {
  const [element, setElement ] = useState(data.element || []);

  useEffect(() => {
    setElement(data.element || []);
  }, [data.element]);
  
  // return (
  //     <Button className="rounded-full flex flex-row items-center gap-1" variant={data.variant ?? "outline"} onClick={data.onClick}>{data.icon}{data.name}</Button>
  // );
  return (
    <>
      {element}
    </>
  );
}
