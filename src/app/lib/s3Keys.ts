export const s3PrefixChat = (userId: string, calendarId: string) => `users/${userId}/calendars/${calendarId}`;
export const s3PrefixMessage = (userId: string, calendarId: string, messageId: string) => `${s3PrefixChat(userId, calendarId)}/messages/${messageId}`;
export const s3KeyMessageJson = (userId: string, calendarId: string, messageId: string) => `${s3PrefixMessage(userId, calendarId, messageId)}/message.json`;
export const s3KeyAttachment = (userId: string, calendarId: string, messageId: string, filename: string) => `${s3PrefixMessage(userId, calendarId, messageId)}/attachments/${encodeURIComponent(filename)}`;
