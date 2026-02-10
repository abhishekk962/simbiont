"use client";

import { useEffect, useState } from "react";
import { Position, useReactFlow, type Node, type Edge } from "@xyflow/react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
} from "@/components/ui/base-node";
import { BaseHandle } from "@/components/ui/base-handle";
import { ChevronsDownUp, GripHorizontal, ListCollapse, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function StepNode({ id, type, data, selected }: any) {
  const [title, setTitle] = useState(data.title || "");
  const [content, setContent] = useState(data.content || "");
  const [imageUrl, setImageUrl] = useState(data.imageUrl || "");
  const [estimatedCost, setEstimatedCost] = useState(data.estimatedCost || 0);
  const [estimatedTime, setEstimatedTime] = useState(data.estimatedTime || 0);
  const [nodesHidden, setNodesHidden] = useState<boolean>(false);
  const [taskStates, setTaskStates] = useState<Record<string, boolean>>({});
  const [tasksOpen, setTasksOpen] = useState(false);
  const { updateNodeData, updateEdgeData, updateNode, getNodes } =
    useReactFlow();
  const {
    setNodes,
    setEdges,
    getNode,
    getEdge,
    getNodeConnections,
    updateEdge,
  } = useReactFlow();

  useEffect(() => {
    setTitle(data.title || "");
    setContent(data.content || "");
    setEstimatedCost(data.estimatedCost || 0);
    setEstimatedTime(data.estimatedTime || 0);
    setImageUrl(data.imageUrl || "");
    updateNodeData(data.historyId, { history: data.history });
    console.log("Image URL updated for node", id, ":", data.imageUrl);
  }, [data]);

  useEffect(() => {
    if (data.historyEdgeIds?.length) {
      data.historyEdgeIds.forEach((edgeId: string) => {
        const historyEdge = getEdge(edgeId);
        if (historyEdge) {
          updateEdgeData(historyEdge.id, { history: data.history });
        }
      });
    }
  }, [data.history]);

  const handleClickCollapse = () => {
    setNodesHidden(!nodesHidden);

    if (!nodesHidden) {
      const visitedNodes = new Set<string>();

      treeTraverseAndCollect(id);

      getNodes().forEach((node) => {
        updateNode(node.id, { hidden: true });
      });

      visitedNodes.forEach((nodeId) => {
        updateNode(nodeId, { hidden: false });
      });

      updateNode(id, { hidden: false });

      function treeTraverseAndCollect(source: string) {
        getNodeConnections({ nodeId: source, type: "target" }).forEach(
          ({ source }) => {
            visitedNodes.add(source);
            treeTraverseAndCollect(source);
          },
        );
      }
    } else {
      getNodes().forEach((node) => {
        updateNode(node.id, { hidden: false });
      });
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 cursor-default">
      <BaseNode className={`${selected ? "border-black border-2" : ""}`}>
        <BaseNodeHeader>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              updateNodeData(id, { ...data, title: e.target.value });
            }}
            className="font-semibold bg-transparent border-none outline-none user-select-text"
            placeholder="Block"
            spellCheck={false}
          />
          <Button
            variant="ghost"
            size="icon-sm"
            className="dragHandle"
            onClick={handleClickCollapse}
          >
            <ChevronsDownUp size={16} />
          </Button>
          <Button variant="ghost" size="icon-sm" className="dragHandle">
            <GripHorizontal size={16} />
          </Button>
        </BaseNodeHeader>
        <BaseNodeContent>
          <AspectRatio ratio={2 / 1} className="bg-muted rounded-lg">
          {/* <img src={imageUrl} alt="" /> */}
            <Image
              src={imageUrl}
              alt="Photo"
              fill
              className="w-full rounded-lg object-cover dark:brightness-20"
            />
          </AspectRatio>
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              updateNodeData(id, { ...data, content: e.target.value });
            }}
            className="field-sizing-content resize-none max-h-[20lh] w-64 nowheel nodrag border-none outline-none user-select-text"
            placeholder="Description"
            spellCheck={false}
          />
              <div className="flex w-full flex-wrap justify-start gap-2">

          {estimatedCost > 0 && (<Badge>{"$" + estimatedCost}</Badge>)}
          {estimatedTime > 0 && <Badge variant="outline">{estimatedTime < 7 ? estimatedTime + " days" : Math.round(estimatedTime / 7) + " weeks"}</Badge>}

          {data.hasAdditionalTagsAssociated &&
            data.additionalTags.map((tag: string) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            </div>
            
            {data.tasks && data.tasks.length > 0 && (
              <Popover open={tasksOpen} onOpenChange={setTasksOpen}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    <ListTodo size={16} className="mr-2" />
                    Tasks ({Object.values(taskStates).filter(Boolean).length}/{data.tasks.length})
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-3" align="start">
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm mb-3">Task Checklist</h4>
                    {data.tasks.map((task: string, index: number) => (
                      <label
                        key={index}
                        className="flex items-start gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={taskStates[task] || false}
                          onChange={(e) => {
                            const newStates = { ...taskStates, [task]: e.target.checked };
                            setTaskStates(newStates);
                            updateNodeData(id, { ...data, taskStates: newStates });
                          }}
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary"
                        />
                        <span className="text-sm flex-1">{task}</span>
                      </label>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            )}
        </BaseNodeContent>
        <BaseHandle type="source" position={Position.Right} id="source" />
        <BaseHandle type="target" position={Position.Left} id="target" />
      </BaseNode>
    </div>
  );
}``