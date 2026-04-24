export function notify(
    message: string,
    type: "info" | "error" = "info",
    duration = 10000,
): void {
    const notificationsContainer = document.getElementById("notifications");
    if (!notificationsContainer) return;

    const el = document.createElement("div");
    el.className = `notification ${type}`;
    el.textContent = message;
    notificationsContainer.appendChild(el);
    setTimeout(() => el.remove(), duration);
}

export function showJsonError(message: string): void {
    notify(message, "error", 10000);
    setTimeout(() => window.location.reload(), 2000);
}