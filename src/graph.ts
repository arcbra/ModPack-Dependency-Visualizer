import "./legend.ts";
import { Network, DataSet, type Edge } from "vis-network/standalone";

// Interfaces
interface GroupAttributes {
    color: string;
    radius: number;
}

interface NetworkAttributes {
    id: string;
    class?: string;
    color: {
        background?: string;
        border: string;
        originalBackground: string;
    };
    checked: boolean;
}

// Recover previous graph data if it was the same
let nodes, edges;
let nodesArray: Record<string, any>[] = JSON.parse(
    localStorage.getItem("lastNodesArray") ?? "[]",
);
let edgesRaw: Edge[] = JSON.parse(localStorage.getItem("lastEdgesRaw") ?? "[]");

// Notify errors
/**
 * Notify on screen if some mod wasn't read correctly.
 * @param message Message to display.
 * @param type Type of notification (color choice). Typically error.
 * @param duration Duration of the notification on screen.
 */
function notify(message: string, type = "error", duration = 10000) {
    const notificationsContainer = document.getElementById("notifications")!;
    const el = document.createElement("div");
    el.className = `notification ${type}`;
    el.textContent = message;
    notificationsContainer.appendChild(el);
    setTimeout(() => el.remove(), duration);
}

const jarErrors: string[] = JSON.parse(
    localStorage.getItem("jarErrors") ?? "[]",
);
jarErrors.map((err) => notify(err));

// Start of the Visualizer
const groupAttributes: Record<string, GroupAttributes> = {
    start: { color: "#ffd008", radius: 200 },
    end: { color: "#02a0ff", radius: 500 },
    both: { color: "#ff8800", radius: 350 },
    addon: { color: "#c7a4f3", radius: 500 },
    orphan: { color: "#ec240e", radius: 700 },
    checkedOrphan: { color: "#2ecc71", radius: 700 },
};
const orphanClasses = new Set(Object.keys(groupAttributes).slice(-2));

const modsRelation: Record<string, string[]> = JSON.parse(
    localStorage.getItem("modsRelation") ?? "[]",
);
const uniqueModsLoaded = new Set(
    Object.entries(modsRelation).flat(2),
) as Set<string>;
const modsLastLoaded = new Set(
    nodesArray.map((mod: Record<string, string>) => mod.id),
) as Set<string>;

/**
 * Checks if it's the first time loading the current mods.
 * @param set1 A Set of mods, could be the current or previous load.
 * @param set2 A Set of mods, could be the current or previous load.
 * @returns True if some mod is not on the previous load. False otherwise.
 */
function checkPageFirstLoad(set1: Set<string>, set2: Set<string>) {
    if (set1.size !== set2.size) return true;
    return [...set1].every((mod) => set2.has(mod)) ? false : true;
}

const isPageFirstLoad = checkPageFirstLoad(uniqueModsLoaded, modsLastLoaded);

if (isPageFirstLoad) {
    notify(
        "Doble click a node to mark as an Addon or a Checked orphan.",
        "info",
        15000,
    );
    notify(
        "Right click a node to search the mod on CurseForge.",
        "info",
        15000,
    );
    const nodeSet: Set<string> = new Set();

    edgesRaw = [];
    Object.entries(modsRelation).map(([key, deps]) => {
        nodeSet.add(key);
        deps.map((dep) => {
            nodeSet.add(dep);
            edgesRaw.push({ from: key, to: dep });
        });
    });

    // Node group definition
    const groupCounts: Record<string, number> = {
        start: 0,
        end: 0,
        both: 0,
        orphan: 0,
    };
    const groupTotals: Record<string, number> = {
        start: 0,
        end: 0,
        both: 0,
        orphan: 0,
    };
    const nodeGroups: Record<string, string> = {};

    [...nodeSet].map((node) => {
        const hasOutgoing = edgesRaw.some((e) => e.from === node);
        const hasIncoming = edgesRaw.some((e) => e.to === node);

        const group =
            hasOutgoing && !hasIncoming
                ? "start"
                : !hasOutgoing && hasIncoming
                  ? "end"
                  : hasOutgoing && hasIncoming
                    ? "both"
                    : "orphan";

        nodeGroups[node] = group;
        groupTotals[group]++;
    });

    // Node formatting
    nodesArray = [...nodeSet].map((id) => {
        const group = nodeGroups[id];
        const angle = (groupCounts[group] / groupTotals[group]) * 2 * Math.PI;
        const r = groupAttributes[group].radius;
        groupCounts[group]++;

        return {
            id,
            label: id,
            x: r * Math.cos(angle),
            y: r * Math.sin(angle),
            color: {
                background: groupAttributes[group].color,
                border: "#181825",
                originalBackground: groupAttributes[group].color,
            },
            checked: false,
            class: group,
        };
    });
}

nodes = new DataSet(nodesArray);
edges = new DataSet(edgesRaw);

const container = document.getElementById("graph") as HTMLDivElement;
const network = new Network(
    container,
    { nodes, edges },
    {
        nodes: {
            shape: "dot",
            size: 30,
            font: {
                size: 10,
                color: "#ffffffe8",
                face: "Mojangles",
            },
            borderWidth: 3,
            shadow: { enabled: true, size: 10, color: "#00000080" },
            color: {
                highlight: {
                    background: "#ffffff",
                    border: "#00000080",
                },
            },
        },
        edges: {
            width: 2,
            arrows: { to: { enabled: true, scaleFactor: 0.8 } },
            color: { color: "#ffffff", opacity: 0.9 },
        },
        physics: {
            enabled: true,
            solver: "repulsion",
            repulsion: {
                nodeDistance: 120,
                centralGravity: 0.1,
            },
            stabilization: { iterations: 200 },
        },
        interaction: {
            hover: true,
            dragNodes: true,
        },
    },
);

// On double click
network.on("doubleClick", ({ nodes: clicked }) => {
    if (clicked.length === 0) return;

    const nodeId = clicked[0];
    const nodeAttributes = nodes.get(nodeId) as unknown as NetworkAttributes;

    const newState = !nodeAttributes.checked;
    nodeAttributes.checked = newState;
    nodeAttributes.color.background = newState
        ? groupAttributes.checkedOrphan.color
        : nodeAttributes.color.originalBackground;

    const newNodesAttributes: NetworkAttributes = {
        id: nodeId,
        checked: newState,
        color: {
            border: "#181825",
            originalBackground: nodeAttributes.color.originalBackground,
        },
    };
    newNodesAttributes.color.background = newState
        ? orphanClasses.has(nodeAttributes.class as string)
            ? groupAttributes.checkedOrphan.color
            : groupAttributes.addon.color
        : nodeAttributes.color.originalBackground;

    nodes.update(newNodesAttributes);
});

// On right click
network.on("oncontext", ({ pointer, event }) => {
    const nodeId = network.getNodeAt(pointer.DOM);
    if (nodeId) {
        event?.preventDefault();
        searchInCurseForge
            ? window.open(
                  `https://www.curseforge.com/minecraft/mc-mods/search?page=1&pageSize=20&sortBy=relevancy&class=mc-mods&search=${nodeId}`,
              )
            : window.open(`https://modrinth.com/discover/mods?q=${nodeId}`);
    }
});

// Add node count on screen
const nodeCountElem = document.getElementById(
    "node-count",
) as HTMLParagraphElement;
nodeCountElem.appendChild(
    document.createTextNode(`Total Nodes: ${nodes.length}`),
);

// Choose search engine
let searchInCurseForge = true;
const searchEngineBtn = document.getElementById(
    "search-motor-btn",
) as HTMLButtonElement;
const curseForgeBtnImg = document.getElementById(
    "curseforge-btn-img",
) as HTMLImageElement;
const modrinthBtnImg = document.getElementById(
    "modrinth-btn-img",
) as HTMLImageElement;

Object.assign(curseForgeBtnImg.style, { visibility: "visible" }); //////////////

searchEngineBtn.addEventListener("click", () => {
    searchInCurseForge = !searchInCurseForge;
    if (searchInCurseForge) {
        Object.assign(curseForgeBtnImg.style, { visibility: "visible" });
        Object.assign(modrinthBtnImg.style, { visibility: "hidden" });
    } else {
        Object.assign(curseForgeBtnImg.style, { visibility: "hidden" });
        Object.assign(modrinthBtnImg.style, { visibility: "visible" });
    }
});

// Save data on unload
const lastNodesData = (nodes: DataSet<any, any>) =>
    nodes.getIds().map((nodeId) => nodes.get(nodeId));

window.addEventListener("beforeunload", () => {
    network.storePositions();
    localStorage.setItem(
        "lastNodesArray",
        JSON.stringify(lastNodesData(nodes)),
    );
    localStorage.setItem("lastEdgesRaw", JSON.stringify(edgesRaw));
});
