import { useState, useMemo } from "react";
import { useAppStore } from "../../store/dataStore";
import { GraphNode, Area } from "../../types/entities";
import { EditNodeModal } from "./EditNodeModal";
import { EditAreaModal } from "./EditAreaModal";

interface NodesPanelProps {
    selectedNodeKey: string | null;
    onNodeSelect: (key: string | null) => void;
}

export function NodesPanel({ selectedNodeKey, onNodeSelect }: NodesPanelProps) {
    const data = useAppStore((state) => state.data);
    const addNode = useAppStore((state) => state.addNode);
    const addArea = useAppStore((state) => state.addArea);
    const updateNode = useAppStore((state) => state.updateNode);
    const deleteNodes = useAppStore((state) => state.deleteNodes);
    const updateArea = useAppStore((state) => state.updateArea);
    const deleteArea = useAppStore((state) => state.deleteArea);

    const [isAddAreaOpen, setIsAddAreaOpen] = useState(false);
    const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
    const [isAreaListOpen, setIsAreaListOpen] = useState(true);
    const [isNodeListOpen, setIsNodeListOpen] = useState(true);

    const [newAreaKey, setNewAreaKey] = useState("");
    const [newAreaName, setNewAreaName] = useState("");
    const [newAreaDesc, setNewAreaDesc] = useState("");

    const [newNodeType, setNewNodeType] = useState<"point" | "waypoint">("point");
    const [newNodeKey, setNewNodeKey] = useState("");
    const [newNodeArea, setNewNodeArea] = useState("");
    const [newNodeName, setNewNodeName] = useState("");

    const [isEditNodeModalOpen, setIsEditNodeModalOpen] = useState(false);
    const [editingNode, setEditingNode] = useState<GraphNode | null>(null);
    const [isEditAreaModalOpen, setIsEditAreaModalOpen] = useState(false);
    const [editingArea, setEditingArea] = useState<Area | null>(null);

    const sortedNodes = useMemo(() => {
        if (!data) return [];
        return [...data.points.values(), ...data.waypoints.values()].sort(
            (a, b) => (a.areaKey + a.key).localeCompare(b.areaKey + b.key)
        );
    }, [data]);

    const allAreas = useMemo(() => {
        if (!data) return [];
        return Array.from(data.areas.values()).sort((a, b) => a.name.localeCompare(b.name));
    }, [data]);

    const handleAddArea = () => {
        if (!newAreaKey.trim() || !newAreaName.trim()) {
            alert("エリアのキーと名前は必須です。");
            return;
        }
        addArea(newAreaKey.trim(), newAreaName.trim(), newAreaDesc.trim());
        setNewAreaKey("");
        setNewAreaName("");
        setNewAreaDesc("");
    };

    const handleAddNode = () => {
        if (!newNodeKey.trim() || !newNodeArea) {
            alert("エリアの選択と地点キーの入力は必須です。");
            return;
        }
        addNode(newNodeType, newNodeKey.trim(), newNodeArea, newNodeName.trim());
        setNewNodeKey("");
        setNewNodeName("");
    };

    const handleOpenEditAreaModal = (area: Area) => {
        setEditingArea(area);
        setIsEditAreaModalOpen(true);
    };

    const handleSaveArea = (key: string, newName: string, newDescription: string) => {
        updateArea(key, newName, newDescription);
        setIsEditAreaModalOpen(false);
        setEditingArea(null);
    };

    const handleDeleteArea = (areaKey: string) => {
        if (!data) return;
        const areaName = data.areas.get(areaKey)?.name || areaKey;
        const nodesInArea = [...data.points.values(), ...data.waypoints.values()].filter(
            (node) => node.areaKey === areaKey
        );
        if (window.confirm(`エリア「${areaName}」を削除しますか？\n関連する地点（${nodesInArea.length}件）もすべて削除されます。`)) {
            deleteArea(areaKey);
        }
    };

    const handleOpenEditModal = (node: GraphNode) => {
        setEditingNode(node);
        setIsEditNodeModalOpen(true);
    };

    const handleSaveNode = (key: string, newArea: string, newName?: string, storage?: boolean) => {
        updateNode(key, newArea, newName, storage);
        setIsEditNodeModalOpen(false);
        setEditingNode(null);
    };

    const handleDeleteNode = (key: string) => {
        if (window.confirm(`地点「${key}」を削除しますか？\n関連する経路もすべて削除されます。`)) {
            deleteNodes([key]);
        }
    };

    if (!data) return null;

    return (
        <>
            <div className="collapsible-section">
                <h3 onClick={() => setIsAddAreaOpen(!isAddAreaOpen)}>
                    <span className="triangle">{isAddAreaOpen ? "▼" : "▶"}</span> エリアを追加
                </h3>
                {isAddAreaOpen && (
                    <div className="add-node-form">
                        <input type="text" placeholder="キー（一意）" value={newAreaKey} onChange={(e) => setNewAreaKey(e.target.value)} />
                        <input type="text" placeholder="名前" value={newAreaName} onChange={(e) => setNewAreaName(e.target.value)} />
                        <input type="text" placeholder="説明" value={newAreaDesc} onChange={(e) => setNewAreaDesc(e.target.value)} />
                        <button onClick={handleAddArea}>追加</button>
                    </div>
                )}
            </div>

            <div className="collapsible-section">
                <h3 onClick={() => setIsAddNodeOpen(!isAddNodeOpen)}>
                    <span className="triangle">{isAddNodeOpen ? "▼" : "▶"}</span> 地点を追加
                </h3>
                {isAddNodeOpen && (
                    <div className="add-node-form">
                        <select value={newNodeArea} onChange={(e) => setNewNodeArea(e.target.value)}>
                            <option value="" disabled>-- エリアを選択 --</option>
                            {allAreas.map((area) => (
                                <option key={area.key} value={area.key}>
                                    {area.name} ({area.key})
                                </option>
                            ))}
                        </select>
                        <select value={newNodeType} onChange={(e) => setNewNodeType(e.target.value as "point" | "waypoint")}>
                            <option value="point">拠点 (Point)</option>
                            <option value="waypoint">経由地 (Waypoint)</option>
                        </select>
                        <input type="text" placeholder="キー（一意）" value={newNodeKey} onChange={(e) => setNewNodeKey(e.target.value)} />
                        {newNodeType === "point" && (
                            <input type="text" placeholder="名前" value={newNodeName} onChange={(e) => setNewNodeName(e.target.value)} />
                        )}
                        <button onClick={handleAddNode}>追加</button>
                    </div>
                )}
            </div>

            <div className="collapsible-section">
                <h3 onClick={() => setIsAreaListOpen(!isAreaListOpen)}>
                    <span className="triangle">{isAreaListOpen ? "▼" : "▶"}</span> エリア一覧
                </h3>
                {isAreaListOpen && (
                    <table>
                        <thead>
                            <tr>
                                <th>名前</th>
                                <th>キー</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allAreas.map((area) => (
                                <tr key={area.key}>
                                    <td>{area.name}</td>
                                    <td>{area.key}</td>
                                    <td>
                                        <button onClick={() => handleOpenEditAreaModal(area)}>編集</button>
                                        <button onClick={() => handleDeleteArea(area.key)} className="delete-button">削除</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <div className="collapsible-section">
                <h3 onClick={() => setIsNodeListOpen(!isNodeListOpen)}>
                    <span className="triangle">{isNodeListOpen ? "▼" : "▶"}</span> 地点一覧
                </h3>
                {isNodeListOpen && (
                    <table>
                        <thead>
                            <tr>
                                <th>種別</th>
                                <th>キー</th>
                                <th>エリア</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedNodes.map((node) => (
                                <tr
                                    key={node.key}
                                    className={node.key === selectedNodeKey ? "selected-row" : ""}
                                    onClick={() => onNodeSelect(node.key)}
                                >
                                    <td>{data.waypoints.has(node.key) ? "経由地" : "拠点"}</td>
                                    <td>{node.key}</td>
                                    <td>{node.areaKey}</td>
                                    <td>
                                        <button onClick={() => handleOpenEditModal(node)}>編集</button>
                                        <button onClick={() => handleDeleteNode(node.key)} className="delete-button">削除</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            <EditNodeModal isOpen={isEditNodeModalOpen} node={editingNode} onClose={() => setIsEditNodeModalOpen(false)} onSave={handleSaveNode} areas={allAreas} />
            <EditAreaModal isOpen={isEditAreaModalOpen} area={editingArea} onClose={() => setIsEditAreaModalOpen(false)} onSave={handleSaveArea} />
        </>
    );
}
