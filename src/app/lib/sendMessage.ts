export async function sendMessage({ calendarId, role = "USER", content, files }: { calendarId: string; role?: "USER" | "ASSISTANT" | "SYSTEM"; content: string; files: File[]; }) {

    const fileData = new FormData();
    fileData.set("calendarId", calendarId);
    fileData.set("role", role);
    fileData.set("content", content);
    
    for (const file of files) fileData.append("files", file, file.name);

    const response = await fetch("/api/messages/send", {

        method: "POST",
        body: fileData,

    });

    if (!response.ok) {

        const error = await response.json().catch(() => ({}));
        throw new Error(error?.error || `Send failed (${response.status})`);

    }

    return response.json();

}
