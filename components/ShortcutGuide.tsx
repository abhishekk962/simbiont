"use client";

import { Kbd, KbdGroup } from "@/components/ui/kbd"
import { useState } from "react"

export default function ShortcutGuide() {

  const [isOpen, setIsOpen] = useState(false);
    
  return (
    <div className="flex flex-col items-center gap-4 text-sm text-gray-500">
      <KbdGroup onMouseEnter={() => setIsOpen(true)} onMouseLeave={() => setIsOpen(false)}>
        <Kbd>Right Click</Kbd>
        {isOpen && <span>to command Simbiont. </span>}
      </KbdGroup>
    </div>
  )
}
