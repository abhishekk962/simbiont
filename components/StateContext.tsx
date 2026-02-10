"use client";

import { createContext } from "react";
import { State } from "@/lib/state";

type StateContextType = {
  state: State,
  setState: React.Dispatch<React.SetStateAction<State>>,
};

export const StateContext = createContext<StateContextType>({
  state: {},
  setState: () => {},
});