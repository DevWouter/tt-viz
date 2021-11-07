import { Vector3 } from "@babylonjs/core";

export interface PathNode {
  position: Vector3;
}

export interface PathEdge {
  from: PathNode;
  to: PathNode;
}

export interface Graph {
  nodes: PathNode[];
  edges: PathEdge[];
}