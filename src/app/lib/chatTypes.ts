export type ChatRole = "user" | "assistant";

export type ChatMessageJSON = {

    id: string;
    role: ChatRole;
    content: string;
    calendarId: string;
    createdAt: string;
    attachments?: Attachment[];

}

export type Attachment = {

    fileName: string;
    mimeType: string;
    size?: number;
    s3Key: string;
    etag?: string;

}

export type AIEventInput = {

    title?: string;
    description?: string;
    location?: string;
    recurrence?: string[];
    startAt: string; 
    endAt: string;
    
}

export type AIEventOperation =
    | { action: "create"; event: AIEventInput }
    | { action: "update"; googleId: string; event: Partial<AIEventInput> }
    | { action: "delete"; googleId: string };

export type AIEventPlan = { operations: AIEventOperation[]};

export type AIEventResult = { 

    created: { googleId: string; htmlLink?: string}[];
    updated: { googleId: string; htmlLink?: string}[];
    deleted: { googleId: string; }[];
    errors: { action: string; googleId?: string; message: string}[];

}