"use client";

import { useState } from "react";
import { Position, useReactFlow } from "@xyflow/react";
import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
} from "@/components/ui/base-node";
import { BaseHandle } from "@/components/ui/base-handle";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";

export default function PlanNode({ id, type, data, selected }: any) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [objective, setObjective] = useState("");
  const [budget, setBudget] = useState([0]);
  const [timeline, setTimeline] = useState([0]);
  const [scale, setScale] = useState("");
  const [constraints, setConstraints] = useState("");
  const { updateNodeData, setNodes } = useReactFlow();

  const maxChars = 275;
  const remainingChars = maxChars - constraints.length;

  const handleSubmit = () => {
    updateNodeData(id, {
      ...data,
      objective,
      budget: budget[0],
      timeline: timeline[0],
      scale,
      constraints,
    });
    console.log("Plan submitted:", {
      objective,
      budget,
      timeline,
      scale,
      constraints,
    });
    data.addToolOutput({
      toolCallId: data.toolCallId,
      tool: data.tool,
      output: {
        planDetails: `Objective: ${objective}\nBudget: $${budget[0]}\nTimeline: ${timeline[0]} weeks\nScale: ${scale}\nConstraints: ${constraints}`,
      },
      state: "output-available",
    });
    setIsCollapsed(true);
  };

  const handleCancel = () => {
    setObjective("");
    setBudget([0]);
    setTimeline([0]);
    setScale("");
    setConstraints("");
  };

  return (
    <div className="flex flex-col items-center gap-2 cursor-default">
      <BaseNode className={`${selected ? "border-black border-2" : ""} w-100`}>
        <BaseNodeHeader>
          <span className="font-semibold">Campaign Fundamentals</span>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="ml-auto"
          >
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </Button>
        </BaseNodeHeader>
        {!isCollapsed && (
          <BaseNodeContent className="space-y-6 p-6">
            {/* Objective Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="objective" className="text-sm font-medium">
                Objective <span className="text-red-500">*</span>
              </Label>
              <Select value={objective} onValueChange={setObjective}>
                <SelectTrigger id="objective" className="w-full">
                  <SelectValue placeholder="Select your objective" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brand-awareness">
                    Brand Awareness
                  </SelectItem>
                  <SelectItem value="engagement">
                    Engagement
                  </SelectItem>
                  <SelectItem value="conversion">
                    Conversion
                  </SelectItem>
                  <SelectItem value="retention">Retention</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="launch">
                    Launch
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Budget Slider */}
            <div className="space-y-2">
              <Label htmlFor="budget" className="text-sm font-medium">
                Budget <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-3">
                <Slider
                  id="budget"
                  min={0}
                  max={42000}
                  step={1000}
                  value={budget}
                  onValueChange={setBudget}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span>US${budget[0].toLocaleString()}</span>
                  <span className="text-muted-foreground">US$42000</span>
                </div>
              </div>
            </div>

            {/* Timeline Slider */}
            <div className="space-y-2">
              <Label htmlFor="timeline" className="text-sm font-medium">
                Timeline <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-3">
                <Slider
                  id="timeline"
                  min={0}
                  max={12}
                  step={1}
                  value={timeline}
                  onValueChange={setTimeline}
                  className="w-full"
                />
                <div className="flex justify-between text-sm">
                  <span>{timeline[0]} weeks</span>
                  <span className="text-muted-foreground">3 months</span>
                </div>
              </div>
            </div>

            {/* Scale Dropdown */}
            <div className="space-y-2">
              <Label htmlFor="scale" className="text-sm font-medium">
                Scale <span className="text-red-500">*</span>
              </Label>
              <Select value={scale} onValueChange={setScale}>
                <SelectTrigger id="scale" className="w-full">
                  <SelectValue placeholder="Select your scale" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="ambitious">Ambitious</SelectItem>
                  <SelectItem value="experimental">Experimental</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Constraints Textarea */}
            <div className="space-y-2">
              <Label htmlFor="constraints" className="text-sm font-medium">
                Constraints
              </Label>
              <Textarea
                id="constraints"
                value={constraints}
                onChange={(e) => {
                  if (e.target.value.length <= maxChars) {
                    setConstraints(e.target.value);
                  }
                }}
                placeholder="Write whatever limitations that we haven't included just yet."
                className="min-h-25 resize-none"
                maxLength={maxChars}
              />
              <p className="text-xs text-muted-foreground">
                {remainingChars} characters left
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>Submit</Button>
            </div>
          </BaseNodeContent>
        )}
        <BaseHandle type="source" position={Position.Right} id="source" />
        <BaseHandle type="target" position={Position.Left} id="target" />
      </BaseNode>
    </div>
  );
}
