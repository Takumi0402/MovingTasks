import { useState } from "react";
import { useAppStore } from "../store/dataStore";
import { NoData } from "../components/layout/NoData.tsx";
import { ServiceMap } from "../components/editor/ServiceMap";
import { InventoryPanel } from "../components/editor/InventoryPanel";
import "./ServicePage.css";

export function ServicePage() {
    const data = useAppStore((state) => state.data);
    const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
    const [focusedNodeKey, setFocusedNodeKey] = useState<string | null>(null);

    if (!data) return <NoData />;

    return (
        <div className="service-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">業務データ編集</h1>
                    <p className="page-subtitle">各拠点における備品の移動前・移動後数量の入力</p>
                </div>
            </div>

            <div className="service-layout">
                <div className="service-map-panel card">
                    <ServiceMap
                        data={data}
                        selectedCategoryKey={selectedCategoryKey}
                        onNodeClick={setFocusedNodeKey}
                        focusedNodeKey={focusedNodeKey}
                    />
                </div>
                <div className="service-inventory-panel card">
                    <InventoryPanel
                        data={data}
                        selectedCategoryKey={selectedCategoryKey}
                        setSelectedCategoryKey={setSelectedCategoryKey}
                        focusedNodeKey={focusedNodeKey}
                        onRowClick={setFocusedNodeKey}
                    />
                </div>
            </div>
        </div>
    );
}
