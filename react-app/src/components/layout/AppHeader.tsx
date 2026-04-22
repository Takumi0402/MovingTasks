import React, { useRef } from "react";
import { useAppStore } from "../../store/dataStore";
import { loadDataFromZip } from "../../services/dataLoader";
import { exportDataToZip } from "../../services/dataExporter";
import { toast } from "react-hot-toast";

export const AppHeader = () => {
    const { data, isLoading, createNewProject, setLoading, setData, setError } = useAppStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setLoading(true);
        try {
            const loadedData = await loadDataFromZip(file);
            setData(loadedData);
        } catch (e) {
            setError(e instanceof Error ? e.message : "不明なエラーが発生しました。");
        }
        event.target.value = "";
    };

    const handleExport = () => {
        if (!data) {
            toast.error("エクスポートするデータがありません。");
            return;
        }
        const date = new Date();
        const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
        exportDataToZip(data, `mapdata_${stamp}.zip`);
        toast.success(`mapdata_${stamp}.zip をエクスポートしました。`);
    };

    return (
        <header className="app-header">
            <div className="app-header__brand">
                <div className="app-header__logo">矢</div>
                <span className="app-header__title">矢上祭タスク管理</span>
            </div>

            <div className="app-header__actions">
                <button onClick={createNewProject} disabled={isLoading}>
                    新規作成
                </button>
                <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="btn-primary">
                    インポート
                </button>
                <input
                    type="file"
                    accept=".zip"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                />
                <button onClick={handleExport} disabled={isLoading || !data}>
                    エクスポート
                </button>
                {isLoading && <span className="header-loading">読み込み中...</span>}
            </div>
        </header>
    );
};
