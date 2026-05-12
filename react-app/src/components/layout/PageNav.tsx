import { NavLink } from "react-router-dom";

export const PageNav = () => {
    return (
        <nav className="page-nav">
            <NavLink to="/" end className="nav-link">
                ホーム
            </NavLink>
            <NavLink to="/master" className="nav-link">
                マスタ編集
            </NavLink>
            <NavLink to="/service" className="nav-link">
                業務データ編集
            </NavLink>
            <NavLink to="/pathfinding" className="nav-link">
                経路計算
            </NavLink>
            <NavLink to="/solver" className="nav-link">
                移動表作成
            </NavLink>
        </nav>
    );
};
