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

export type AIEventPlan = {

  operations: Array<
    | {

        action: "create";
        event: {
          title?: string;
          description?: string;
          location?: string;
          recurrence?: string[];
          startAt: string;
          endAt: string;
        };

      }

    | {

        action: "update";
        googleId: string;
        event: {
          title?: string;
          description?: string;
          location?: string;
          recurrence?: string[];
          startAt?: string;
          endAt?: string;
        };

      }

    | {

        action: "delete";
        googleId: string;

      }

  >;

};

export type AIEventResult = {

  created: Array<{ googleId: string; htmlLink?: string }>;
  updated: Array<{ googleId: string; htmlLink?: string }>;
  deleted: Array<{ googleId: string }>;
  errors: Array<{
    
    action?: "create" | "update" | "delete" | "unknown" | string;
    googleId?: string;
    message: string;
    index?: number; 
    status?: number;
    detail?: any; 

  }>;
  
};
