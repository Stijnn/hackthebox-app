import { Node, NodeProps } from "@xyflow/react";
import { v4 } from "uuid";

export const createUniqueName = <
  T extends Node<Record<string, unknown>, string | undefined>
>(
  node: NodeProps<T>
) => {
  return `${node.type}_${v4()}`;
};
