import { useState, useEffect } from "react";
import { useAppStore } from "../../store/dataStore";
import { useExportTasksToExcel } from "../../hooks/useExportTasksToExcel";
import "./TransportationSolver.css";

export const TransportationSolver = () => {
    const { data, isSolving, solverResult, error, solveTransportationProblem, solveTransportationProblemFast } = useAppStore();

    const [penalty, setPenalty] = useState<number>(0);
    const [displayCategory, setDisplayCategory] = useState<string>("all");
    const [timeLimit, setTimeLimit] = useState<number>(60);
    const [selectedCategoryKeys, setSelectedCategoryKeys] = useState<string[]>([]);
    const { exportToExcel } = useExportTasksToExcel();

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => e.target.select();

    useEffect(() => {
        if (data && data.objectCategories.size > 0 && selectedCategoryKeys.length === 0) {
            setSelectedCategoryKeys(Array.from(data.objectCategories.keys()));
        }
    }, [data]);

    const categoryOptions = data ? Array.from(data.objectCategories.values()) : [];
    const allTasks = data?.tasks ? Array.from(data.tasks.values()) : [];
    const filteredTasks = displayCategory === "all"
        ? allTasks
        : allTasks.filter((t) => t.object.key === displayCategory);

    const handleCategoryToggle = (key: string, checked: boolean) => {
        setSelectedCategoryKeys((prev) => checked ? [...prev, key] : prev.filter((k) => k !== key));
    };

    const statusLabel = (status: string) => {
        if (status === "Optimal") return { text: "最適解", cls: "badge-success" };
        if (status === "Feasible") return { text: "暫定解", cls: "badge-info" };
        return { text: "解なし", cls: "badge-danger" };
    };

    return (
        <div className="solver-layout">
            {/* ===== 左: 設定パネル ===== */}
            <div className="solver-settings card">
                <div className="card-header">
                    <h2 className="solver-settings__title">計算設定</h2>
                </div>
                <div className="card-body">
                    <div className="solver-field">
                        <label className="solver-field__label">計算対象カテゴリ</label>
                        <div className="solver-checkboxes">
                            {categoryOptions.map((cat) => (
                                <label key={cat.key} className="solver-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={selectedCategoryKeys.includes(cat.key)}
                                        onChange={(e) => handleCategoryToggle(cat.key, e.target.checked)}
                                    />
                                    <span>{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="solver-field">
                        <label className="solver-field__label">タスクペナルティ</label>
                        <input
                            type="number"
                            value={penalty}
                            onChange={(e) => setPenalty(Number(e.target.value))}
                            onFocus={handleFocus}
                        />
                    </div>

                    <div className="solver-field">
                        <label className="solver-field__label">計算時間の上限（秒）</label>
                        <input
                            type="number"
                            value={timeLimit}
                            min="1"
                            onChange={(e) => setTimeLimit(Number(e.target.value))}
                            onFocus={handleFocus}
                        />
                    </div>

                    <div className="solver-actions">
                        <button
                            className="btn-primary"
                            onClick={() => solveTransportationProblemFast(penalty, timeLimit, selectedCategoryKeys)}
                            disabled={isSolving || selectedCategoryKeys.length === 0}
                        >
                            {isSolving ? "計算中..." : "指定時間内で計算"}
                        </button>
                        <button
                            onClick={() => solveTransportationProblem(penalty, selectedCategoryKeys)}
                            disabled={isSolving || selectedCategoryKeys.length === 0}
                        >
                            {isSolving ? "計算中..." : "完全解を計算"}
                        </button>
                    </div>

                    {error && <p className="solver-error">{error}</p>}
                </div>
            </div>

            {/* ===== 右: 結果パネル ===== */}
            <div className="solver-results">
                {solverResult ? (
                    <>
                        <div className="solver-summary card">
                            <div className="card-header solver-summary__header">
                                <h2 className="solver-settings__title">計算結果サマリー</h2>
                                <button
                                    onClick={() => exportToExcel(
                                        solverResult,
                                        data ? new Map(data.objectCategories) : new Map(),
                                        penalty, timeLimit, selectedCategoryKeys, ""
                                    )}
                                >
                                    Excelにエクスポート
                                </button>
                            </div>
                            <div className="solver-summary__list">
                                {solverResult.map((result) => {
                                    const { text, cls } = statusLabel(result.status);
                                    return (
                                        <div key={result.objectKey} className="solver-summary__item">
                                            <span className="solver-summary__name">
                                                {data?.objectCategories.get(result.objectKey)?.name || result.objectKey}
                                            </span>
                                            <span className={`badge ${cls}`}>{text}</span>
                                            {["Optimal", "Feasible"].includes(result.status) && (
                                                <span className="solver-summary__meta">
                                                    コスト {result.totalCost?.toFixed(1)} &nbsp;/&nbsp; {result.taskCount} タスク
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="solver-tasks card">
                            <div className="card-header solver-tasks__header">
                                <h2 className="solver-settings__title">生成されたタスク（{filteredTasks.length}件）</h2>
                                <select
                                    value={displayCategory}
                                    onChange={(e) => setDisplayCategory(e.target.value)}
                                    style={{ width: "auto" }}
                                >
                                    <option value="all">すべて表示</option>
                                    {categoryOptions.map((cat) => (
                                        <option key={cat.key} value={cat.key}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="solver-task-list">
                                {filteredTasks.length > 0 ? (
                                    filteredTasks.map((task) => (
                                        <div key={task.id} className="solver-task-item">
                                            <span className="solver-task-route">
                                                {task.fromPoint} <span className="solver-task-arrow">→</span> {task.toPoint}
                                            </span>
                                            <span className="solver-task-count">{task.count}個</span>
                                            <span className="badge badge-info">{task.object.name}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="solver-empty">表示対象のタスクはありません。</p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="solver-placeholder card">
                        <div className="no-data-icon">⚡</div>
                        <p className="no-data-title">計算結果がありません</p>
                        <p className="no-data-desc">左のパネルから設定を行い、計算を実行してください。</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransportationSolver;
