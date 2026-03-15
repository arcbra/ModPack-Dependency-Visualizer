let isVisible = JSON.parse(localStorage.getItem("lastIsVisible") ?? "true");

// DOM
const legendImg = document.getElementById(
    "node-legend-img",
) as HTMLImageElement;
const legendArrowImg = document.getElementById(
    "node-legend-arrow-img",
) as HTMLImageElement;
const legendArrowBtn = document.getElementById(
    "node-legend-arrow",
) as HTMLButtonElement;

// Functions
/**
 * Define the mutable attributes of the legend, depending on if it's visible on screen or not.
 * @param isVisible Checks if the legend is visible on screen.
 */
function defineLegend(isVisible: boolean) {
    const legendPos: Record<string, string> = {
        hidden: "-50%",
        visible: "5px",
    };
    const legendArrowPos: Record<string, string> = {
        hidden: "5px",
        visible: "235px",
    };
    const visibilityState = isVisible ? "visible" : "hidden";
    // Legend
    legendImg.style.left = legendPos[visibilityState];

    // Arrow
    Object.assign(legendArrowImg.style, {
        left: legendArrowPos[visibilityState],
        visibility: "visible",
        transform: isVisible ? "rotate(180deg)" : "rotate(0deg)",
    });
}

defineLegend(isVisible);
legendImg.style.visibility = "visible";

// EventListeners
legendArrowBtn.addEventListener("click", () => {
    isVisible = !isVisible;
    defineLegend(isVisible);
    localStorage.setItem("lastIsVisible", JSON.stringify(isVisible));
});
