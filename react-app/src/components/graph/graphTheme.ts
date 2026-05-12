import type { CSSProperties } from "react";

export type GraphNodeType = "point" | "waypoint";
export type GraphNodeVisualRole = "default" | "selected" | "route-start" | "route-end" | "route-middle";

export const GRAPH_THEME = {
    nodeSize: {
        point: 100,
        waypoint: 60,
    },
    node: {
        pointBorder: "#1a192b",
        waypointBorder: "#888",
        pointBackground: "#fff",
        waypointBackground: "#f0f0f0",
        selectedBorder: "#007bff",
    },
    edge: {
        defaultColor: "#b1b1b7",
        activeColor: "#007bff",
        defaultWidth: 1,
        activeWidth: 3,
    },
    route: {
        startBackground: "#28a745",
        startBorder: "#1e7e34",
        endBackground: "#dc3545",
        endBorder: "#b21f2d",
        middleBackground: "#ffc107",
        middleBorder: "#d39e00",
    },
} as const;

export const getNodeSize = (nodeType: GraphNodeType): number => GRAPH_THEME.nodeSize[nodeType];

export const getBaseCircleNodeStyle = (nodeType: GraphNodeType, role: GraphNodeVisualRole = "default"): CSSProperties => {
    const isPoint = nodeType === "point";
    const defaultStyle: CSSProperties = {
        backgroundColor: isPoint ? GRAPH_THEME.node.pointBackground : GRAPH_THEME.node.waypointBackground,
        border: `2px solid ${isPoint ? GRAPH_THEME.node.pointBorder : GRAPH_THEME.node.waypointBorder}`,
        color: "#000",
        fontWeight: "normal",
    };

    if (role === "selected") {
        return {
            ...defaultStyle,
            border: `3px solid ${GRAPH_THEME.node.selectedBorder}`,
        };
    }

    if (role === "route-start") {
        return {
            ...defaultStyle,
            backgroundColor: GRAPH_THEME.route.startBackground,
            border: `3px solid ${GRAPH_THEME.route.startBorder}`,
            color: "#fff",
            fontWeight: "bold",
        };
    }

    if (role === "route-end") {
        return {
            ...defaultStyle,
            backgroundColor: GRAPH_THEME.route.endBackground,
            border: `3px solid ${GRAPH_THEME.route.endBorder}`,
            color: "#fff",
            fontWeight: "bold",
        };
    }

    if (role === "route-middle") {
        return {
            ...defaultStyle,
            backgroundColor: GRAPH_THEME.route.middleBackground,
            border: `3px solid ${GRAPH_THEME.route.middleBorder}`,
            color: "#000",
            fontWeight: "bold",
        };
    }

    return defaultStyle;
};

export const getBaseEdgeStyle = (isHighlighted: boolean): CSSProperties => ({
    strokeWidth: isHighlighted ? GRAPH_THEME.edge.activeWidth : GRAPH_THEME.edge.defaultWidth,
    stroke: isHighlighted ? GRAPH_THEME.edge.activeColor : GRAPH_THEME.edge.defaultColor,
});
