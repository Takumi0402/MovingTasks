import React, { useRef } from "react";
import { useAppStore } from "../store/dataStore";
import { loadDataFromZip } from "../services/dataLoader";
import "./ProjectHubPage.css";

export const ProjectHubPage = () => {
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

    return (
        <div className="hub-page">
            {/* ===== ヒーローセクション ===== */}
            <div className="hub-hero">
                <div className="hub-hero__badge">矢上祭 2025→2026</div>
                <h1 className="hub-hero__title">机椅子輸送最適化プロジェクト</h1>
                <p className="hub-hero__desc">キャンパス内の机・椅子の移動タスクを、自動で最適化するためのシステム。</p>
            </div>

            {/* ===== プロジェクト操作パネル ===== */}
            <div className="hub-panel">
                {data ? (
                    /* ---- データ読み込み済み ---- */
                    <div className="hub-loaded">
                        <div className="hub-loaded__header">
                            <span className="hub-loaded__indicator" />
                            <span className="hub-loaded__label">プロジェクト読み込み済み</span>
                        </div>
                        <div className="hub-stats">
                            <div className="hub-stat">
                                <span className="hub-stat__value">{data.areas.size}</span>
                                <span className="hub-stat__label">エリア</span>
                            </div>
                            <div className="hub-stat">
                                <span className="hub-stat__value">{data.points.size}</span>
                                <span className="hub-stat__label">拠点</span>
                            </div>
                            <div className="hub-stat">
                                <span className="hub-stat__value">{data.waypoints.size}</span>
                                <span className="hub-stat__label">経由地</span>
                            </div>
                            <div className="hub-stat">
                                <span className="hub-stat__value">{data.paths.size}</span>
                                <span className="hub-stat__label">経路</span>
                            </div>
                            <div className="hub-stat">
                                <span className="hub-stat__value">{data.objectCategories.size}</span>
                                <span className="hub-stat__label">備品種別</span>
                            </div>
                            <div className="hub-stat">
                                <span className="hub-stat__value">{data.routes.size}</span>
                                <span className="hub-stat__label">最短経路</span>
                            </div>
                            <div className="hub-stat">
                                <span className="hub-stat__value">{data.tasks.size}</span>
                                <span className="hub-stat__label">タスク</span>
                            </div>
                        </div>
                        <div className="hub-loaded__actions">
                            <button onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                                別ファイルを読み込む
                            </button>
                            <button onClick={createNewProject} disabled={isLoading}>
                                新規作成に切り替える
                            </button>
                        </div>
                    </div>
                ) : (
                    /* ---- データ未読み込み ---- */
                    <div className="hub-import">
                        <div className="hub-import__icon">📁</div>
                        <h2 className="hub-import__title">プロジェクトを開始する</h2>
                        <p className="hub-import__desc">既存のプロジェクトファイル（.zip）を読み込むか、新規プロジェクトを作成してください。</p>
                        <div className="hub-import__actions">
                            <button className="btn-primary" onClick={() => fileInputRef.current?.click()} disabled={isLoading}>
                                ZIPファイルを読み込む
                            </button>
                            <button onClick={createNewProject} disabled={isLoading}>
                                新規作成
                            </button>
                        </div>
                    </div>
                )}
                <input type="file" accept=".zip" ref={fileInputRef} onChange={handleFileChange} style={{ display: "none" }} />
            </div>

            {/* ===== アルゴリズム説明セクション ===== */}
            <div className="hub-algo">
                <h2 className="hub-algo__title">処理フロー</h2>
                <div className="hub-algo__steps">
                    <div className="hub-step">
                        <div className="hub-step__num">01</div>
                        <div className="hub-step__body">
                            <h3>マスタデータ編集</h3>
                            <p>地点・経路・備品カテゴリを定義し、グラフ構造を構築する。</p>
                        </div>
                    </div>
                    <div className="hub-step__arrow">→</div>
                    <div className="hub-step">
                        <div className="hub-step__num">02</div>
                        <div className="hub-step__body">
                            <h3>業務データ編集</h3>
                            <p>各拠点における備品の移動前・移動後の数量を入力する。</p>
                        </div>
                    </div>
                    <div className="hub-step__arrow">→</div>
                    <div className="hub-step">
                        <div className="hub-step__num">03</div>
                        <div className="hub-step__body">
                            <h3>経路計算</h3>
                            <p>ダイクストラ法により全拠点間の最短経路・距離を算出する。</p>
                        </div>
                    </div>
                    <div className="hub-step__arrow">→</div>
                    <div className="hub-step">
                        <div className="hub-step__num">04</div>
                        <div className="hub-step__body">
                            <h3>移動表作成</h3>
                            <p>輸送問題（線形計画法）で総コスト最小のタスク割り当てを生成する。</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
