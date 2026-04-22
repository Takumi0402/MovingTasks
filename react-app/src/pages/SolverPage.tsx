import { useAppStore } from "../store/dataStore";
import { NoData } from "../components/layout/NoData.tsx";
import { TransportationSolver } from "../components/solver/TransportationSolver.tsx";
import "./SolverPage.css";

export function SolverPage() {
    const data = useAppStore((state) => state.data);
    if (!data) return <NoData />;

    return (
        <div className="solver-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">移動表作成</h1>
                    <p className="page-subtitle">輸送問題（線形計画法）による最適タスク割り当ての生成</p>
                </div>
            </div>
            <TransportationSolver />
        </div>
    );
}
