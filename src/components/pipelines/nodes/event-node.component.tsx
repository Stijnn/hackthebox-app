import {
  BaseNode,
  BaseNodeContent,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/base-node";
import { LabeledHandle } from "@/components/labeled-handle";
import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { ComputeNode } from "./compute-node.component";

export type EventNodeData = {
  eventName: string;
  onInvoke?: () => Promise<void> | void;
};

export type EventNode = Node<EventNodeData>;

export const EventNode = ({ id, data }: NodeProps<EventNode>) => {
  const { updateNodeData, getNode, getNodeConnections } = useReactFlow();

  const onInvoke = () => {
    console.log("Invoke called");
    getNodeConnections({ nodeId: id, type: "source" })
      .map((conn) => getNode(conn.target))
      .map((n) => n as ComputeNode)
      .forEach(async (n) => {
        console.log(n);
        await n.data.computeFunction?.call(this, { callerId: id });
      });
  };

  useEffect(() => {
    updateNodeData(id, { ...data, onInvoke });
  }, []);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>On: {data.eventName}</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeContent className="px-0">
        <LabeledHandle type="source" position={Position.Right} title="Do" />
      </BaseNodeContent>
    </BaseNode>
  );
};
