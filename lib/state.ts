import { z } from "zod";
import { id } from "zod/v4/locales";

// Main schema
export const stateSchema = z.object({
  recentNodes: z.array(z.any()).optional(),
  lastAddedNodeId: z.string().optional(),
  selectedNodeIds: z.array(z.string()).optional(),
  imagePosition: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }).optional(),
});

// Export the inferred type
export type State = z.infer<typeof stateSchema>;
