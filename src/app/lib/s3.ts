import { S3Client, PutObjectCommand, CopyObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const s3 = new S3Client({

    region: process.env.AWS_REGION!,
    credentials: { 

        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,

    }

});

export const s3Bucket = process.env.S3_BUCKET_NAME!;

export async function s3ReadObjectAsString(key: string) { 

    const response = await s3.send(new GetObjectCommand({ 
    
        Bucket: s3Bucket, 
        Key: key 
    
    }));
    if(!response.Body) throw new Error ("No S3 Body");

    const objectAsString = await response.Body.transformToString("utf-8");
    return objectAsString;
    
};

export async function s3ReadObjectAsBytes(key: string){

    const response = await s3.send(new GetObjectCommand({ 
    
        Bucket: s3Bucket, 
        Key: key 
    
    }));
    if(!response.Body) throw new Error ("No S3 Body");

    const objectAsBytes = await response.Body.transformToByteArray();
    return objectAsBytes;

};

export async function s3WriteObject(key: string, body: string | Uint8Array, contentType: string){

    await s3.send(new PutObjectCommand({
        
        Bucket: s3Bucket,
        Key: key, 
        Body: body,
        ContentType: contentType,

    }));

};

export async function s3DeleteObject(key: string){

    await s3.send(new DeleteObjectCommand({

        Bucket: s3Bucket,
        Key: key,

    }));

};

export async function s3ListObjects(prefix: string){

    const response = await s3.send(new ListObjectsV2Command({

        Bucket: s3Bucket,
        Prefix: prefix,

    }));

    if (!response.Contents || response.Contents.length === 0) console.log(`No objects found under prefix: ${prefix}`);

    return response.Contents ?? [];

};

export function s3MessageKey(ownerId: string, calendarId: string, messageId: string){

    return `users/${ownerId}/calendars/${calendarId}/messages/${messageId}.json`;

};

export async function s3WriteMessageJSON(ownerId: string, calendarId: string, messageId: string, body: any){

    const key = s3MessageKey(ownerId, calendarId, messageId);
    const json = JSON.stringify(body, null, 2);
    await s3WriteObject(key, json, "application/json");
    return key;

};

export async function s3DeleteMessageJSON(ownerId: string, calendarId: string, messageId: string){

    const key = s3MessageKey(ownerId, calendarId, messageId);
    await s3DeleteObject(key);

};

export function s3StagedAttachmentKey(ownerId: string, calendarId: string, tempId: string, filename: string) {
    
    return `users/${ownerId}/calendars/${calendarId}/staged/${tempId}/${filename}`;

}

export function s3CommittedAttachmentKey(ownerId: string, calendarId: string, messageId: string, filename: string) {
   
    return `users/${ownerId}/calendars/${calendarId}/messages/${messageId}/attachments/${filename}`;

}

export function s3MessagesPrefix(ownerId: string, calendarId: string) {

    return `users/${ownerId}/calendars/${calendarId}/messages/`;

}

export async function s3CopyObject(fromKey: string, key: string, contentType?: string) {

    await s3.send(

        new CopyObjectCommand({

            Bucket: s3Bucket,
            CopySource: `/${s3Bucket}/${fromKey}`,
            Key: key,
            ContentType: contentType,
            MetadataDirective: "REPLACE",

        })

    );

}

export async function s3SignedGetUrl(key: string, expiresInSeconds = 600) {

    const command = new GetObjectCommand({ Bucket: s3Bucket, Key: key });
    return getSignedUrl(s3, command, { expiresIn: expiresInSeconds });

}

export async function s3DeletePrefix(prefix: string) {

    let continuationToken: string | undefined;

    do {

        const page = await s3.send(

            new ListObjectsV2Command({
                Bucket: s3Bucket,
                Prefix: prefix,
                ContinuationToken: continuationToken,
            })
        
        );

        const keys = (page.Contents ?? []).map((object) => ({ Key: object.Key! }));

        if (keys.length > 0) await s3.send(new DeleteObjectsCommand({ Bucket: s3Bucket, Delete: { Objects: keys } }));
        
        continuationToken = page.NextContinuationToken;

    } while (continuationToken);

}
