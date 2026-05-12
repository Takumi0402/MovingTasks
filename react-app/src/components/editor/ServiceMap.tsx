// src/components/editor/ServiceMap.tsx

import { useMemo, useCallback, useEffect } from "react";
// ★ 1. Controlsを追加でインポート
import ReactFlow, { Background, Handle, Position, Controls, useReactFlow, ReactFlowProvider } from "reactflow";
import type { Node, Edge, NodeProps, NodeMouseHandler } from "reactflow";
import "reactflow/dist/style.css";
import { Data } from "../../services/dataLoader";
import { getBaseCircleNodeStyle, getBaseEdgeStyle, getNodeSize } from "../graph/graphTheme";

// --- Propsの型定義 ---
interface ServiceMapProps {
    data: Data;
    selectedCategoryKey: string | null;
    onNodeClick: (nodeKey: string) => void;
    focusedNodeKey: string | null;
}

// --- カスタムノードのデータ型定義 ---
type ServiceNodeData = {
    name: string;
    from: number;
    to: number;
    isWaypoint: boolean;
};

// --- カスタムノードコンポーネント ---
const ServiceNode = ({ data, selected }: NodeProps<ServiceNodeData>) => {
    const nodeType = data.isWaypoint ? "waypoint" : "point";
    const size = getNodeSize(nodeType);
    const fontS = data.isWaypoint ? "0.7em" : "1em";
    const visualStyle = getBaseCircleNodeStyle(nodeType, selected ? "selected" : "default");
    const nodeStyle: React.CSSProperties = {
        width: size,
        height: size,
        padding: data.isWaypoint ? 6 : 8,
        borderRadius: "50%",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontSize: fontS,
        position: "relative",
        transition: "border 0.15s ease-in-out",
        ...visualStyle,
    };

    const nameStyle: React.CSSProperties = { fontWeight: "bold" };
    const quantityStyle: React.CSSProperties = { marginTop: "5px", fontSize: "1em", color: "#007bff", fontWeight: "bold" };
    const handleStyle: React.CSSProperties = { top: "50%", background: "transparent", border: "none" };

    return (
        <div style={nodeStyle}>
            <Handle type="source" position={Position.Top} style={handleStyle} />
            <Handle type="target" position={Position.Top} style={handleStyle} />
            <div style={nameStyle}>{data.name}</div>
            {!data.isWaypoint && (
                <div style={quantityStyle}>
                    {data.from} → {data.to}
                </div>
            )}
        </div>
    );
};
const nodeTypes = { serviceNode: ServiceNode };

// --- React Flowのロジックを持つ内部コンポーネント ---
function Flow(props: ServiceMapProps) {
    const { data, selectedCategoryKey, onNodeClick, focusedNodeKey } = props;
    const { fitView } = useReactFlow();

    const { nodesForMap, edgesForMap } = useMemo(() => {
        if (!data) return { nodesForMap: [], edgesForMap: [] };

        const selectedCategory = data.objectCategories.get(selectedCategoryKey || "");

        const pointNodes: Node<ServiceNodeData>[] = Array.from(data.points.values()).map((point) => {
            const quantity = selectedCategory ? point.objects.get(selectedCategory) : null;
            return {
                id: point.key,
                type: "serviceNode",
                position: { x: point.x, y: point.y },
                selected: point.key === focusedNodeKey, // 選択状態を反映
                data: {
                    name: point.name,
                    from: quantity?.fromAmount ?? 0,
                    to: quantity?.toAmount ?? 0,
                    isWaypoint: false,
                },
            };
        });
        const waypointNodes: Node<ServiceNodeData>[] = Array.from(data.waypoints.values()).map((waypoint) => {
            return {
                id: waypoint.key,
                type: "serviceNode",
                position: { x: waypoint.x, y: waypoint.y },
                selected: waypoint.key === focusedNodeKey,
                data: {
                    name: waypoint.key, // Waypointにはnameがないのでkeyを表示
                    from: 0, // 在庫情報はない
                    to: 0,
                    isWaypoint: true, // Waypointであるフラグ
                },
            };
        });

        const nodesForMap = [...pointNodes, ...waypointNodes];

        const edgesForMap: Edge[] = Array.from(data.paths.values()).map((path) => ({
            id: `e-${path.from.key}-${path.to.key}`,
            source: path.from.key,
            target: path.to.key,
            type: "straight",
            style: getBaseEdgeStyle(false),
        }));

        return { nodesForMap, edgesForMap };
    }, [data, selectedCategoryKey, focusedNodeKey]);

    useEffect(() => {
        if (focusedNodeKey) {
            fitView({
                nodes: [{ id: focusedNodeKey }],
                duration: 400,
                padding: 0.8,
            });
        }
    }, [focusedNodeKey, fitView]);

    const handleNodeClick: NodeMouseHandler = useCallback(
        (_event, node) => {
            onNodeClick(node.id);
        },
        [onNodeClick],
    );

    return (
        <div style={{ width: "100%", height: "100%" }}>
            <ReactFlow nodes={nodesForMap} edges={edgesForMap} nodeTypes={nodeTypes} nodesDraggable={false} nodesConnectable={false} elementsSelectable={true} onNodeClick={handleNodeClick} fitView>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
}

// --- エクスポートするメインコンポーネント ---
export function ServiceMap(props: ServiceMapProps) {
    return (
        <ReactFlowProvider>
            <Flow {...props} />
        </ReactFlowProvider>
    );
}
