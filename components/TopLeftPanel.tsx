"use client";

import Image from "next/image";
import { ChevronDown, LogOutIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

export default function TopLeftPanel({
  showProjectDetails = true,
}: {
  showProjectDetails?: boolean;
}) {
  const { user, isLoading } = useUser();
  const [title, setTitle] = useState("Untitled");
  const [workspace, setWorkspace] = useState(`...Loading`);

  useEffect(() => {
    setWorkspace(`${user?.nickname}'s workspace`)
  }, [isLoading])

  useEffect(() => {
    const savedTitle = localStorage.getItem("title");
    if (savedTitle) setTitle(savedTitle);
  }, []);

  useEffect(() => {
    localStorage.setItem("title", title);
  }, [title]);

  return (
    <div className="absolute top-0 left-0 z-10 m-4">
      <DropdownMenu>
        <div className="flex flex-row">
          <DropdownMenuTrigger asChild>
            <div className="flex flex-row items-center gap-2 text-gray-500 hover:bg-gray-100 px-2 py-2 rounded-md cursor-pointer">
              <Image src="/logo150.png" alt="Sample" width={34} height={30} />
              <ChevronDown />
            </div>
          </DropdownMenuTrigger>
          {showProjectDetails && (
            <div className="flex flex-col ml-2">
              <input
                className="bg-transparent border-none outline-none user-select-text selection:bg-gray-300 selection:text-gray-900"
                onChange={(e) => setTitle(e.target.value)}
                value={title}
                spellCheck="false"
              />
              <input
                className="bg-transparent border-none outline-none user-select-text text-gray-500 selection:bg-gray-300 selection:text-gray-900"
                onChange={(e) => setWorkspace(e.target.value)}
                value={workspace}
                spellCheck="false"
              />
            </div>
          )}
        </div>
        <DropdownMenuContent className="w-56 text-gray-700" align="start">
          <DropdownMenuItem onClick={() => (window.location.href = "/")}>
            Home
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="flex flex-row gap-2"
            onClick={() => window.close()}
          >
            <LogOutIcon /> <a href="/auth/logout">Log out</a>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
