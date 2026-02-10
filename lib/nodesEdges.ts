import { type Node, type Edge } from "@xyflow/react";
import CustomEdge from "@/components/CustomEdge";
import AnyNode from "@/components/AnyNode";
import ElementNode from "@/components/ElementNode";
import PromptNode from "@/components/PromptNode";
import ImageNode from "@/components/ImageNode";
import CommentNode from "@/components/CommentNode";
import DrawingNode from "@/components/DrawingNode";
import ResearchNode from "@/components/ResearchNode"
import QuestionNode from "@/components/QuestionNode";
import StepNode from "@/components/StepNode";
import { useReactFlow, XYPosition } from "@xyflow/react";
import PlanNode from "@/components/PlanNode";

export const initialNodes: Node[] = [
];

export const initialEdges: Edge[] = [];

export const edgeTypes = {
  custom: CustomEdge,
};

export const nodeTypes = {
  any: AnyNode,
  element: ElementNode,
  prompt: PromptNode,
  image: ImageNode,
  comment: CommentNode,
  drawing: DrawingNode,
  research: ResearchNode,
  question: QuestionNode,
  step: StepNode,
  plan: PlanNode
};

export function getRelativePositionWithNodeId(
  relativePosition: "above" | "below" | "left" | "right",
  relativeToNodeId: string,
  getNode: (id: string) => Node | undefined
): XYPosition {
  const relativeNode = getNode(relativeToNodeId);
  if (!relativeNode) {
    return { x: 0, y: 0 };
  }
  console.log("Relative Node Position:", relativeNode.position);
  const xOffset = 500; // Distance from the relative node
  const yOffset = 200;
  
  switch (relativePosition) {
    case "above":
      return { x: relativeNode.position.x, y: relativeNode.position.y - yOffset };
    case "below":
      return { x: relativeNode.position.x, y: relativeNode.position.y + yOffset };
    case "left":
      return { x: relativeNode.position.x - xOffset, y: relativeNode.position.y };
    case "right":
      return { x: relativeNode.position.x + xOffset, y: relativeNode.position.y };
    default:
      return { x: 0, y: 0 };
  }
}