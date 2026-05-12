// src/components/pathfinding/RouteMiniMap.tsx

import { useCallback, useMemo } from "react";
import ReactFlow, { Background, Controls, Handle, Position } from "reactflow";
import type { Edge, Node, NodeMouseHandler, NodeProps } from "reactflow";
import "reactflow/dist/style.css";
import type { Data } from "../../services/dataLoader";
import type { Route } from "../../types/entities";
import { getBaseCircleNodeStyle, getBaseEdgeStyle, getNodeSize } from "../graph/graphTheme";

// --- Propsの型定義 ---
interface RouteMiniMapProps {
    data: Data;
    highlightedRoute: Route | null;
    selectedStartNodeKey: string | null;
    selectedEndNodeKey: string | null;
    onNodePairChange: (startNodeKey: string | null, endNodeKey: string | null) => void;
}

// --- 1. GraphEditorからCircleNodeを移植・改造 ---
// RouteMiniMap.tsx 内の CircleNode

type CircleNodeData = {
    label: string;
    nodeType: "point" | "waypoint";
    visualRole: "default" | "route-start" | "route-end" | "route-middle";
};

const CircleNode = ({ data }: NodeProps<CircleNodeData>) => {
    const size = getNodeSize(data.nodeType);
    const visualStyle = getBaseCircleNodeStyle(data.nodeType, data.visualRole);

    // ★ 1. Handle（接続点）用のスタイルを定義
    const handleStyle: React.CSSProperties = {
        width: 1,
        height: 1,
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "transparent",
        border: "none",
    };

    const divStyle: React.CSSProperties = {
        // --- 1. 基本的なスタイルを追加 ---
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: "5px",
        boxSizing: "border-box",

        // --- 2. 形状とサイズを定義 ---
        width: size,
        height: size,
        borderRadius: "50%", // ★ これで円形になります
        fontSize: data.nodeType === "point" ? "1em" : "0.7em",

        ...visualStyle,
    };

    return (
        <>
            <Handle type="source" position={Position.Top} style={handleStyle} />
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <div style={divStyle}>{data.label}</div>
        </>
    );
};

const nodeTypes = { circle: CircleNode };

// --- 2. メインコンポーネント ---
export const RouteMiniMap = ({ data, highlightedRoute, selectedStartNodeKey, selectedEndNodeKey, onNodePairChange }: RouteMiniMapProps) => {
    const handleNodeClick: NodeMouseHandler = useCallback(
        (_event, node) => {
            if (node.data.nodeType !== "point") return;

            if (!selectedStartNodeKey) {
                onNodePairChange(node.id, null);
                return;
            }

            if (!selectedEndNodeKey) {
                if (node.id === selectedStartNodeKey) {
                    onNodePairChange(null, null);
                } else {
                    onNodePairChange(selectedStartNodeKey, node.id);
                }
                return;
            }

            onNodePairChange(node.id, null);
        },
        [onNodePairChange, selectedEndNodeKey, selectedStartNodeKey],
    );

    const { nodes, edges } = useMemo(() => {
        const allGraphNodes = [...data.points.values(), ...data.waypoints.values()];

        const nodes: Node<CircleNodeData>[] = allGraphNodes.map((node) => {
            let visualRole: CircleNodeData["visualRole"] = "default";

            if (highlightedRoute) {
                if (node.key === highlightedRoute.from) {
                    visualRole = "route-start";
                } else if (node.key === highlightedRoute.to) {
                    visualRole = "route-end";
                } else if (highlightedRoute.nodeKeys.includes(node.key)) {
                    visualRole = "route-middle";
                }
            }

            if (node.key === selectedStartNodeKey) {
                visualRole = "route-start";
            } else if (node.key === selectedEndNodeKey) {
                visualRole = "route-end";
            }

            return {
                id: node.key,
                type: "circle",
                position: { x: node.x, y: node.y },
                data: {
                    label: "name" in node ? node.name : node.key,
                    nodeType: "name" in node ? "point" : "waypoint",
                    visualRole,
                },
            };
        });

        // --- エッジの生成ロジック ---
        const edges: Edge[] = Array.from(data.paths.values()).map((path) => {
            let isPathInRoute = false;
            if (highlightedRoute) {
                for (let i = 0; i < highlightedRoute.nodeKeys.length - 1; i++) {
                    const current = highlightedRoute.nodeKeys[i];
                    const next = highlightedRoute.nodeKeys[i + 1];
                    if ((current === path.from.key && next === path.to.key) || (current === path.to.key && next === path.from.key)) {
                        isPathInRoute = true;
                        break;
                    }
                }
            }

            return {
                id: `e-${path.from.key}-${path.to.key}`,
                source: path.from.key,
                target: path.to.key,
                type: "straight", // ★ 直線エッジを指定
                animated: isPathInRoute,
                style: getBaseEdgeStyle(isPathInRoute),
            };
        });

        return { nodes, edges };
    }, [data, highlightedRoute, selectedEndNodeKey, selectedStartNodeKey]);

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false} // 選択操作自体は不可にする
            onNodeClick={handleNodeClick}
            fitView
        >
            <Background />
            <Controls showInteractive={false} />
        </ReactFlow>
    );
};
