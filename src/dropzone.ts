const dropZone = document.getElementById("drop-zone") as HTMLLabelElement;

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

    dropZone.dispatchEvent(
        new CustomEvent("files-dropped", {
            bubbles: true,
            detail: { files: e.dataTransfer!.files },
        }),
    );
});
