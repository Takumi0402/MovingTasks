import { useState } from "react";
import { useAppStore } from "../store/dataStore";
import { ObjectEditor } from "../components/editor/ObjectEditor.tsx";
import { GraphEditor } from "../components/editor/GraphEditor.tsx";
import { DataInspector } from "../components/editor/DataInspector";
import { NoData } from "../components/layout/NoData.tsx";
import { Tabs } from "../components/editor/Tabs.tsx";
import "./MasterPage.css";

const TABS = [
    { id: "points", label: "グラフ" },
    { id: "objects", label: "備品" },
];

export function MasterPage() {
    const data = useAppStore((state) => state.data);
    const [activeTab, setActiveTab] = useState<string>(TABS[0].id);
    const [selectedNodeKey, setSelectedNodeKey] = useState<string | null>(null);
    const [selectedPathKey, setSelectedPathKey] = useState<string | null>(null);
    const [isInspectorOpen, setIsInspectorOpen] = useState(true);

    if (!data) return <NoData />;

    return (
        <div className="master-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">マスタデータ編集</h1>
                    <p className="page-subtitle">地点・経路・備品カテゴリの定義とグラフ構造の編集</p>
                </div>
                {activeTab === "points" && (
                    <button onClick={() => setIsInspectorOpen(!isInspectorOpen)}>
                        {isInspectorOpen ? "インスペクターを隠す" : "インスペクターを表示"}
                    </button>
                )}
            </div>

            <Tabs tabs={TABS} activeTab={activeTab} setActiveTab={setActiveTab} />

            {activeTab === "objects" && <ObjectEditor />}

            {activeTab === "points" && (
                <div className="master-graph-layout">
                    <div className="master-graph-editor">
                        <GraphEditor
                            selectedNodeKey={selectedNodeKey}
                            onNodeSelect={setSelectedNodeKey}
                            selectedPathKey={selectedPathKey}
                            onPathSelect={setSelectedPathKey}
                        />
                    </div>
                    {isInspectorOpen && (
                        <div className="master-inspector">
                            <DataInspector
                                selectedNodeKey={selectedNodeKey}
                                onNodeSelect={setSelectedNodeKey}
                                selectedPathKey={selectedPathKey}
                                onPathSelect={setSelectedPathKey}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
