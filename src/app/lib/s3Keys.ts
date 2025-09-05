export function s3PrefixChat(userId: string, calendarId: string) {
  return `users/${userId}/calendars/${calendarId}/chat`;
}

export function s3KeyMessageJson(userId: string, calendarId: string, messageId: string) {
  return `${s3PrefixChat(userId, calendarId)}/messages/${messageId}/message.json`;
}

export function s3PrefixAttachments(userId: string, calendarId: string) {
  return `${s3PrefixChat(userId, calendarId)}/attachments`;
}

export function s3KeyAttachmentObject(
  userId: string,
  calendarId: string,
  attachmentId: string,
  filename: string
) {

  const safeName = filename.replace(/[^\w.\-]+/g, "_");
  return `${s3PrefixAttachments(userId, calendarId)}/${attachmentId}/${safeName}`;
  
}
