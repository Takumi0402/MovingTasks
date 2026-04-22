import type { Data } from "./dataLoader";
import type { ProblemDataForApi, SolverResponse } from "../types/apiTypes";
import { QuantityChange } from "../types/entities";

export async function solveProblemApi(currentData: Data, taskPenalty: number, endpoint: string, timeLimit?: number, targetObjectCategoryKeys?: string[]): Promise<SolverResponse> {
    let categoryKeys: string[];
    if (targetObjectCategoryKeys && targetObjectCategoryKeys.length > 0) {
        categoryKeys = targetObjectCategoryKeys;
    } else {
        // 既存の自動判定ロジック
        categoryKeys = [];
        for (const category of currentData.objectCategories.values()) {
            let totalSupply = 0;
            let totalDemand = 0;
            for (const point of currentData.points.values()) {
                const quantityChange = point.objects.get(category);
                if (quantityChange) {
                    const diff = quantityChange.toAmount - quantityChange.fromAmount;
                    if (diff > 0) totalDemand += diff;
                    else if (diff < 0) totalSupply += -diff;
                }
            }
            if (totalSupply > 0 || totalDemand > 0) {
                categoryKeys.push(category.key);
            }
        }
    }

    if (categoryKeys.length === 0) {
        throw new Error("計算対象にできる備品がありません。");
    }

    const pointsForApi = Array.from(currentData.points.values()).reduce(
        (acc, point) => {
            const newObjects = Array.from(point.objects.entries()).reduce(
                (objAcc, [category, quantityChange]) => {
                    objAcc[category.key] = quantityChange;
                    return objAcc;
                },
                {} as { [key: string]: QuantityChange },
            );
            acc[point.key] = { ...point, objects: newObjects };
            return acc;
        },
        {} as ProblemDataForApi["points"],
    );

    const problemData: ProblemDataForApi = {
        objectCategories: Object.fromEntries(currentData.objectCategories.entries()),
        points: pointsForApi,
        routes: Object.fromEntries(currentData.routes.entries()),
        taskPenalty: taskPenalty,
        targetObjectCategoryKeys: categoryKeys,
    };
    if (timeLimit !== undefined) {
        problemData.timeLimitSeconds = timeLimit;
    }

    const PRODUCTION_API_URL = "https://movingtasks-pythonapi.onrender.com";
    const DEVELOPMENT_API_URL = "http://localhost:8000";
    const apiUrl = window.location.hostname === "localhost" ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;

    // デバッグ用: 送信先と送信データをコンソールに出力
    try {
        console.log("solveProblemApi: sending request", {
            apiUrl: `${apiUrl}/${endpoint}`,
            problemData,
            timeLimit,
        });

        const response = await fetch(`${apiUrl}/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(problemData),
        });

        console.log("solveProblemApi: response status", response.status, response.statusText);

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error("solveProblemApi: error response", errorData);
            throw new Error(errorData?.detail || "APIリクエストに失敗しました");
        }

        const results: SolverResponse = await response.json();
        console.log("solveProblemApi: response body", results);
        return results;
    } catch (err) {
        console.error("solveProblemApi: caught error", err);
        throw err;
    }
}
