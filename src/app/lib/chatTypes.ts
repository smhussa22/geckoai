export type ChatRole = "user" | "assistant" | "system";

export type ChatAttachment = {
    id: string;
    filename: string;
    mimeType: string;
    size: number;
};

export type ChatMessageJSON = {
    id: string;
    role: ChatRole;
    content: string;
    calendarId: string;
    createdAt: string;
    attachments?: ChatAttachment[];
};
