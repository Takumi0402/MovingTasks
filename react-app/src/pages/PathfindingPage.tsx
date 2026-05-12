import { NoData } from "../components/layout/NoData.tsx";
import { useAppStore } from "../store/dataStore";
import { calculateAllPointToPointRoutes } from "../services/pathfinding";
import { CalculationStatus } from "../components/pathfinding/CalculationStatus";
import { PathfindingControls } from "../components/pathfinding/PathfindingControls";
import { RouteViewer } from "../components/pathfinding/RouteViewer";
import "./PathfindingPage.css";

export const PathfindingPage = () => {
    const data = useAppStore((state) => state.data);
    const isRouteStale = useAppStore((state) => state.isRouteStale);
    const setRoutes = useAppStore((state) => state.setRoutes);

    const handleCalculateAll = () => {
        if (!data) return;
        setRoutes(calculateAllPointToPointRoutes(data.points, data.waypoints, data.paths));
    };

    if (!data) return <NoData />;

    return (
        <div className="pathfinding-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">経路計算</h1>
                    <p className="page-subtitle">ダイクストラ法による全拠点間の最短経路・距離の算出</p>
                </div>
            </div>

            <div className="pathfinding-controls-row">
                <PathfindingControls onCalculate={handleCalculateAll} />
                <CalculationStatus routeCount={data.routes.size} isStale={isRouteStale} />
            </div>

            <div className="pathfinding-viewer">
                <RouteViewer />
            </div>
        </div>
    );
};
