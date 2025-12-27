import {
  BaseNode,
  BaseNodeFooter,
  BaseNodeHeader,
  BaseNodeHeaderTitle,
} from "@/components/base-node";
import { Node, NodeProps, Position, useReactFlow } from "@xyflow/react";
import { useEffect } from "react";
import { SingleConnectionHandle } from "../components/single-connection-handle.component";

export type ComputeInput<T> = T & {};

export type ComputeFunctionProps = {
  callerId?: string;
};

export type ComputeNodeData = {
  computeFunction?: ({ callerId }: ComputeFunctionProps) => Promise<any> | any;
};

export type ComputeNode = Node<ComputeNodeData>;

export const ComputeNode = ({ id, data }: NodeProps<ComputeNode>) => {
  const { updateNodeData, getNode, getNodeConnections } = useReactFlow();

  const nextInComputeChain = () => {
    getNodeConnections({ type: "source", nodeId: id })
      .map((nodeConnection) => getNode(nodeConnection.target))
      .map((n) => n as ComputeNode)
      .map((n) => n.data)
      .forEach(async (nd) => {
        if (nd.computeFunction) {
          await nd.computeFunction.call(this, { callerId: id });
        }
      });
  };

  const onCompute = ({ callerId }: ComputeFunctionProps) => {
    console.log(`Compute ${id} called from ${callerId}`);
    nextInComputeChain();
  };

  useEffect(() => {
    updateNodeData(id, { ...data, computeFunction: onCompute });
  }, []);

  return (
    <BaseNode>
      <BaseNodeHeader>
        <BaseNodeHeaderTitle>Compute Node</BaseNodeHeaderTitle>
      </BaseNodeHeader>
      <BaseNodeFooter className="grid px-0">
        <SingleConnectionHandle
          id="target-1"
          type="target"
          position={Position.Left}
          title={"Run"}
        />
        <SingleConnectionHandle
          id="source-1"
          type="source"
          position={Position.Right}
          title={"Next"}
        />
      </BaseNodeFooter>
    </BaseNode>
  );
};
