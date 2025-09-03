import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";

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
    
}

export async function s3ReadObjectAsBytes(key: string){

    const response = await s3.send(new GetObjectCommand({ 
    
        Bucket: s3Bucket, 
        Key: key 
    
    }));
    if(!response.Body) throw new Error ("No S3 Body");

    const objectAsBytes = await response.Body.transformToByteArray();
    return objectAsBytes;

}

export async function s3WriteObject(key: string, body: string | Uint8Array, contentType: string){

    await s3.send(new PutObjectCommand({
        
        Bucket: s3Bucket,
        Key: key, 
        Body: body,
        ContentType: contentType,

    }));

}

export async function s3DeleteObject(key: string){

    await s3.send(new DeleteObjectCommand({

        Bucket: s3Bucket,
        Key: key,

    }));

}

export async function s3ListObjects(prefix: string){

    const response = await s3.send(new ListObjectsV2Command({

        Bucket: s3Bucket,
        Prefix: prefix,

    }));

    if (!response.Contents || response.Contents.length === 0) console.log(`No objects found under prefix: ${prefix}`);

    return response.Contents ?? [];

}
