import { useState } from "react";
import { useAppStore } from "../../store/dataStore";
import { PathsPanel } from "./PathsPanel";
import { NodesPanel } from "./NodesPanel";
import { Tabs } from "./Tabs";
import "./DataInspector.css";

const INSPECTOR_TABS = [
    { id: "nodes", label: "地点・エリア" },
    { id: "paths", label: "経路" },
];

interface DataInspectorProps {
    selectedNodeKey: string | null;
    onNodeSelect: (key: string | null) => void;
    selectedPathKey: string | null;
    onPathSelect: (key: string | null) => void;
}

export function DataInspector({ selectedNodeKey, onNodeSelect, selectedPathKey, onPathSelect }: DataInspectorProps) {
    const [activeTab, setActiveTab] = useState<string>(INSPECTOR_TABS[0].id);
    const data = useAppStore((state) => state.data);

    if (!data) {
        return <div className="inspector-container">データを読み込んでください。</div>;
    }

    return (
        <div className="inspector-container">
            <Tabs tabs={INSPECTOR_TABS} activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="inspector-content">
                {activeTab === "paths" && <PathsPanel selectedPathKey={selectedPathKey} onPathSelect={onPathSelect} />}
                {activeTab === "nodes" && <NodesPanel selectedNodeKey={selectedNodeKey} onNodeSelect={onNodeSelect} />}
            </div>
        </div>
    );
}
