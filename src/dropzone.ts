const dropZone = document.getElementById("drop-zone") as HTMLLabelElement;

/**
 * Shows error notification and reloads the page.
 * @param message Error message to display.
 */
export function showJsonError(message: string): void {
    const el = document.createElement("div");
    el.className = "notification error";
    el.textContent = message;
    document.getElementById("notifications")!.appendChild(el);
    setTimeout(() => window.location.reload(), 2000);
}

/**
 * Processes a JSON file, validates it, saves to localStorage and redirects.
 * @param file The JSON file to process.
 */
export function processJsonFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target!.result as string);
            if (!data.nodes || !data.edges) {
                throw new Error("Invalid graph JSON structure");
            }
            localStorage.setItem("importedGraph", JSON.stringify(data));
            localStorage.removeItem("modsRelation");
            window.location.href = "graph.html";
        } catch {
            showJsonError("Error loading JSON: file is corrupted or malformed.");
        }
    };
    reader.readAsText(file);
}

// EventListeners
dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#646cff";
});

dropZone.addEventListener("dragleave", () => {
    dropZone.style.borderColor = "#cccccc";
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.style.borderColor = "#cccccc";

    const files = e.dataTransfer!.files;

    // Check if a JSON file was dropped
    const jsonFile = Array.from(files).find((f) => f.name.endsWith(".json"));
    if (jsonFile) {
        processJsonFile(jsonFile);
        return;
    }

    dropZone.dispatchEvent(
        new CustomEvent("files-dropped", {
            bubbles: true,
            detail: { files },
        }),
    );
});