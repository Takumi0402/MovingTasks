from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pulp
import time

from pydantic import BaseModel, Field

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://yagamifes-it.github.io/MovingTasks",
    "https://yagamifes-it.github.io",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuantityChangeModel(BaseModel):
    fromAmount: int
    toAmount: int


class ObjectCategoryModel(BaseModel):
    key: str
    name: str


class PointModel(BaseModel):
    key: str
    name: str
    areaKey: str
    x: float
    y: float
    objects: dict[str, QuantityChangeModel]
    storage: bool = False


class RouteModel(BaseModel):
    key: str
    from_node: str = Field(alias='from')
    to_node: str = Field(alias='to')
    distance: float
    nodeKeys: list[str]


class ProblemDataModel(BaseModel):
    objectCategories: dict[str, ObjectCategoryModel]
    points: dict[str, PointModel]
    routes: dict[str, RouteModel]
    taskPenalty: int
    targetObjectCategoryKeys: list[str]
    timeLimitSeconds: int = 60


@app.get("/")
def health_check():
    return {"status": "ok"}


def _build_lp_problem(data: ProblemDataModel, category_key: str):
    """カテゴリに対するLP問題を構築して返す共通ヘルパー。"""
    supply_nodes = {}
    demand_nodes = {}

    for point_key, point in data.points.items():
        if category_key in point.objects:
            change = point.objects[category_key].toAmount - point.objects[category_key].fromAmount
            if change < 0:
                supply_nodes[point_key] = -change
            elif change > 0:
                demand_nodes[point_key] = change

    costs = {(r.from_node, r.to_node): r.distance for r in data.routes.values()}

    prob = pulp.LpProblem("Transportation_Problem", pulp.LpMinimize)
    route_keys = [(s, d) for s in supply_nodes for d in demand_nodes]
    route_vars = pulp.LpVariable.dicts("Route", route_keys, lowBound=0, cat='Integer')
    task_vars = pulp.LpVariable.dicts("TaskActive", route_keys, cat='Binary')

    prob += (
        pulp.lpSum([route_vars[r] * costs.get(r, 1e9) for r in route_keys]) +
        pulp.lpSum([task_vars[r] * data.taskPenalty for r in route_keys]),
        "Total_Cost"
    )

    for s_key, s_amount in supply_nodes.items():
        prob += pulp.lpSum([route_vars[(s_key, d_key)] for d_key in demand_nodes]) == s_amount

    for d_key, d_amount in demand_nodes.items():
        point = data.points[d_key]
        change = point.objects[category_key].toAmount - point.objects[category_key].fromAmount
        if point.storage and change > 0:
            prob += pulp.lpSum([route_vars[(s_key, d_key)] for s_key in supply_nodes]) <= d_amount
        else:
            prob += pulp.lpSum([route_vars[(s_key, d_key)] for s_key in supply_nodes]) == d_amount

    M = sum(supply_nodes.values()) if supply_nodes else 1
    for r in route_keys:
        prob += route_vars[r] <= M * task_vars[r]

    return prob, route_keys, route_vars


def _extract_routes(route_keys, route_vars, category_key):
    """求解済みの変数から輸送ルートのリストを抽出する共通ヘルパー。"""
    routes = []
    for r in route_keys:
        amount = pulp.value(route_vars[r])
        if amount is not None and amount > 0:
            routes.append({
                "supplyNode": r[0],
                "demandNode": r[1],
                "amount": amount,
                "objectKey": category_key,
            })
    return routes


@app.post("/solve-dynamic-problem")
def solve_dynamic_problem(data: ProblemDataModel):
    """完全最適解を求める。時間制限なし。"""
    final_response = []

    for category_key in data.targetObjectCategoryKeys:
        prob, route_keys, route_vars = _build_lp_problem(data, category_key)
        prob.solve(pulp.PULP_CBC_CMD(msg=0))

        status = pulp.LpStatus[prob.status]
        category_routes = _extract_routes(route_keys, route_vars, category_key) if status == "Optimal" else []

        final_response.append({
            "objectKey": category_key,
            "status": status,
            "totalCost": pulp.value(prob.objective) if status == "Optimal" else None,
            "taskCount": len(category_routes),
            "routes": category_routes,
        })

    return final_response


@app.post("/solve-dynamic-problem-fast")
def solve_dynamic_problem_fast(data: ProblemDataModel):
    """時間制限付きで求解し、最適解または暫定解を返す。"""
    final_response = []

    for category_key in data.targetObjectCategoryKeys:
        prob, route_keys, route_vars = _build_lp_problem(data, category_key)

        solver = pulp.PULP_CBC_CMD(timeLimit=data.timeLimitSeconds, msg=0)
        start_time = time.time()
        prob.solve(solver)
        solve_time = time.time() - start_time

        status = pulp.LpStatus[prob.status]
        objective_value = pulp.value(prob.objective)

        if objective_value is not None:
            if status == "Optimal" and solve_time < data.timeLimitSeconds * 0.98:
                custom_status = "Optimal"
            else:
                custom_status = "Feasible"
        else:
            custom_status = "Infeasible"

        category_routes = _extract_routes(route_keys, route_vars, category_key) if custom_status in ["Optimal", "Feasible"] else []

        final_response.append({
            "objectKey": category_key,
            "status": custom_status,
            "totalCost": objective_value,
            "taskCount": len(category_routes),
            "routes": category_routes,
        })

    return final_response
