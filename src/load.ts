import "./dropzone";
import { defaultDependenciesJSON } from "./defaultDependencies.json";
import JSZip, { type JSZipObject } from "jszip";
import * as TOML from "toml";
import progressBar from "progressbar.js";
import type Line from "progressbar.js/line";

// Mods basic data
const defaultDependencies = new Set(defaultDependenciesJSON);
const modsRelationRaw: Record<string, string[]> = {};
const modsIdToDisplayName: Record<string, string> = {};
const extraDependencies: Record<string, string> = {};
const EXTRA_JARS_PATTERN = /\.jar$/;

// DOM
const submitBtn = document.getElementById("submit-btn") as HTMLButtonElement;
const clearBtn = document.getElementById("clear-btn") as HTMLButtonElement;
const progressBarContainer = document.getElementById(
    "progress-bar",
) as HTMLDivElement;
const fileInput = document.getElementById("file-input") as HTMLInputElement;
const fileList = document.getElementById("file-list") as HTMLUListElement;
let allFiles: File[] = [];
const jarErrors: string[] = [];

// Functions
/**
 * Updates the updated file list on the page.
 * @param newFiles List of new files to add to the complete list.
 */
function updateFileList(newFiles: FileList | []) {
    allFiles = [...allFiles, ...newFiles].filter(
        (file, index, arr) =>
            file.name.endsWith(".jar") &&
            arr.findIndex((f) => f.name === file.name) === index,
    );

    fileList.innerHTML = "";
    allFiles.map((file) => {
        const li = document.createElement("li");
        li.textContent = file.name;
        fileList.appendChild(li);
    });
}

/**
 * Process the Fabric manifest and saves the data on modsRelationRaw.
 * @param fabricFile Corresponding Fabric manifest.
 * @param fileName Name of the current JAR.
 * @param lastMainMod Last main mod made.
 * @param isMainMod Checks if the current JAR is a main mod.
 * @returns The mod Id.
 */
async function processFabricManifest(
    fabricFile: JSZipObject,
    fileName: string,
    lastMainMod: string | null = null,
    isMainMod: boolean = true,
) {
    const MANIFEST_FABRIC_BAD_FORMAT = /"description"\s?:\s?".+?",/gs;
    const manifestTextFabric = (await fabricFile.async("text")).replaceAll(
        MANIFEST_FABRIC_BAD_FORMAT,
        "",
    );

    let manifest;
    try {
        manifest = JSON.parse(manifestTextFabric);
    } catch {
        if (isMainMod) jarErrors.push(`Couldn't read the file: ${fileName}`);
        return;
    }

    const depId = manifest.id;
    if (!isMainMod && lastMainMod) {
        extraDependencies[depId] = lastMainMod;
        return;
    }

    const depValuesRaw = Object.keys(manifest.depends ?? {});
    const depKeys: string[] = manifest.provides ?? [depId];

    depKeys.forEach((id) => {
        modsRelationRaw[id] = depValuesRaw;
        modsIdToDisplayName[id] = manifest.name;
    });
    return depId;
}

/**
 * Process the ForgeLike manifest and saves the data on modsRelationRaw.
 * @param forgeLikeFile Corresponding ForgeLike manifest.
 * @param fileName Name of the current JAR.
 * @param lastMainMod Last main mod made.
 * @param isMainMod Checks if the current JAR is a main mod.
 * @returns The mod Id.
 */
async function processForgeLikeManifest(
    forgeLikeFile: JSZipObject,
    fileName: string,
    lastMainMod: string | null = null,
    isMainMod: boolean = true,
) {
    const MANIFEST_FORGE_LIKE_BAD_FORMAT = /^\[[^\[](.+\n)+]?/gm;
    const manifestTextForgeLike = (
        await forgeLikeFile.async("text")
    ).replaceAll(MANIFEST_FORGE_LIKE_BAD_FORMAT, "");

    let manifest;
    try {
        manifest = TOML.parse(manifestTextForgeLike);
    } catch {
        if (isMainMod) jarErrors.push(`Couldn't read the file: ${fileName}`);
        return;
    }

    const modInfo = manifest.mods[0];
    const depId: string = modInfo.modId;
    if (!isMainMod && lastMainMod) {
        extraDependencies[depId] = lastMainMod;
        return;
    }

    const depValuesRaw: Record<string, string>[] =
        manifest.dependencies?.[modInfo.modId] ?? [];

    modsRelationRaw[depId] = depValuesRaw
        .filter((dep) => dep.type === "required" || dep.mandatory)
        .map((dep) => dep.modId);

    modsIdToDisplayName[depId] = modInfo.displayName;
    return depId;
}

/**
 * Gets manifest type (Fabric or ForgeLike) and filepath.
 * @param matches Matches of the ForgeLike manifest (Array of paths).
 * @param zip The JAR file decompressed.
 * @param fileName Name of the current JAR.
 * @param isMainMod Checks if the current JAR is a main mod.
 * @returns Type (Fabric or ForgeLike) and filepath.
 */
function getManifestInfo(
    matches: JSZipObject[],
    zip: JSZip,
    fileName: string,
    isMainMod = true,
) {
    const JARJAR_PATH = "META-INF/jarjar/metadata.json";
    const FABRIC_MANIFEST_NAME = "fabric.mod.json";

    const isForgeLike = matches.length === 0 ? false : true;
    if (!isForgeLike) {
        if (zip.file(JARJAR_PATH)) return; // ignore JarJar

        const fabricFile = zip.file(FABRIC_MANIFEST_NAME);
        if (!fabricFile) {
            if (zip.file(EXTRA_JARS_PATTERN)) return; // ignore external mod inside if it does not have a fabric manifest

            if (isMainMod)
                jarErrors.push(`Couldn't read the file: ${fileName}`);
            return;
        }
        return [false, fabricFile];
    }
    return [true, matches[0]];
}

/**
 * Process the file, running the corresponding secondary processes.
 * @param file Raw file input.
 * @param lastMainMod Last main mod made.
 * @param isMainMod Checks if the current JAR is a main mod.
 * @returns The decompressed JAR and the last main mod.
 */
async function processFile(
    file: File | JSZipObject,
    lastMainMod: string | null = null,
    isMainMod = true,
) {
    const MANIFEST_FILENAME_PATTERN = /META-INF\/.*mods\.toml/;

    const buffer =
        file instanceof File
            ? await file.arrayBuffer()
            : await file.async("arraybuffer");
    const zip = await JSZip.loadAsync(buffer);
    const manifestMatches = zip.file(MANIFEST_FILENAME_PATTERN);
    const [isForgeLike, manifestFile] = (getManifestInfo(
        manifestMatches,
        zip,
        file.name,
        isMainMod,
    ) ?? []) as [boolean, JSZipObject];

    if (typeof isForgeLike !== "undefined") {
        const newMainMod = isForgeLike
            ? await processForgeLikeManifest(
                  manifestFile,
                  file.name,
                  lastMainMod,
                  isMainMod,
              )
            : await processFabricManifest(
                  manifestFile,
                  file.name,
                  lastMainMod,
                  isMainMod,
              );
        lastMainMod = newMainMod ?? lastMainMod;
    }
    return [zip, lastMainMod];
}

/**
 * Executes all the main process.
 * @param file Raw file input.
 */
async function mainProcess(file: File) {
    // Main manifest
    const [zip, lastMainMod] = (await processFile(file)) as [JSZip, string];
    let extraJarsMatches;
    if (zip) extraJarsMatches = zip.file(EXTRA_JARS_PATTERN);

    // Extra jars
    if (extraJarsMatches)
        await Promise.all(
            extraJarsMatches.map(
                async (extraJar) =>
                    await processFile(extraJar, lastMainMod, false),
            ),
        );
}

// EventListeners
//// File list
document.addEventListener("files-dropped", (e) => {
    const newCustomEvent = e as CustomEvent;
    fileInput.files = newCustomEvent.detail.files;
    updateFileList(newCustomEvent.detail.files);

    const fileCounterP = document.getElementById(
        "file-counter",
    ) as HTMLParagraphElement;
    fileCounterP.textContent = `Total files: ${allFiles.length}`;
    // fileCounterP.appendChild(
    //     document.createTextNode(`Total files: ${allFiles.length}`),
    // );
});

fileInput.addEventListener("change", () =>
    updateFileList(fileInput.files as FileList),
);

//// Buttons
clearBtn.addEventListener("click", () => {
    fileInput.value = "";
    allFiles = [];
    updateFileList([]);
});

submitBtn.addEventListener("click", async () => {
    submitBtn.disabled = true;
    submitBtn.textContent = "Processing...";

    // Progress Bar
    const bar: Line = new progressBar.Line(progressBarContainer, {
        strokeWidth: 5,
        easing: "easeInOut",
        duration: 100,
        color: "#FFEA82",
        trailColor: "#1e1e2e",
        trailWidth: 1,
        svgStyle: { width: "100%", height: "100%" },
        text: {
            style: {
                color: "slategray",
                position: "absolute",
                right: "0",
                top: "30px",
                padding: 0,
                margin: 0,
                transform: null,
            },
        },
        step: (_: any, bar: any) => {
            bar.setText(Math.ceil(bar.value() * 100) + " %");
        },
    });

    // Main process execution
    let analyzedFileCount = 0;
    await Promise.all(
        allFiles.map((file) =>
            mainProcess(file).then(() => {
                analyzedFileCount += 1;
                bar.animate(
                    Math.ceil((analyzedFileCount / allFiles.length) * 100) /
                        100,
                );
            }),
        ),
    );

    const excludeExtraDep = (dep: string) => extraDependencies[dep] ?? dep;
    const resolveDep = (key: string, deps: string[]) => {
        const filteredDep = deps.filter((dep) => !defaultDependencies.has(dep));
        const mappedDep = filteredDep.map(
            (dep) => modsIdToDisplayName[excludeExtraDep(dep)] ?? dep,
        );
        const resolvedDep = mappedDep.filter((dep) => key !== dep);
        return resolvedDep;
    };

    const modsRelation = Object.entries(modsRelationRaw).reduce(
        (acc, [key, deps]) => {
            if (defaultDependencies.has(key)) return acc;
            const newKey = modsIdToDisplayName[key] ?? key;
            const newVals = [...new Set(resolveDep(newKey, deps))];

            acc[newKey] = newVals;
            return acc;
        },
        {} as Record<string, string[]>,
    );

    sessionStorage.setItem("jarErrors", JSON.stringify(jarErrors));
    sessionStorage.setItem("modsRelation", JSON.stringify(modsRelation));

    window.location.href = "graph.html";
});
