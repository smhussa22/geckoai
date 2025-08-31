// lib/uploads.ts

type FileToUpload = {

  name: string;
  type: string;
  size: number;
  
};

type PresignResponse = {

  attachments: {

    id: string;
    putUrl: string;
    key: string;
    filename: string;
    type: string;
    size: number;

  }[];

};

export async function uploadWithPresignedUrls(files: File[]): Promise<string[]> {

  try {

    const fileData: FileToUpload[] = files.map(file => ({

      name: file.name,
      type: file.type || 'application/octet-stream',
      size: file.size,

    }));

    const presignResponse = await fetch('/api/uploads/presign', {

      method: 'POST',
      headers: {

        'Content-Type': 'application/json',

      },
      body: JSON.stringify({ files: fileData }),

    });

    if (!presignResponse.ok) {

      const errorData = await presignResponse.json();
      throw new Error(`Failed to get presigned URLs: ${errorData.error || 'Unknown error'}`);

    }

    const { attachments }: PresignResponse = await presignResponse.json();

    const uploadPromises = attachments.map(async (attachment, index) => {

      const file = files[index];
      
      try {

        const uploadResponse = await fetch(attachment.putUrl, {

          method: 'PUT',
          headers: {

            'Content-Type': attachment.type,

          },
          body: file,

        });

        if (!uploadResponse.ok) {

          throw new Error(`S3 upload failed with status: ${uploadResponse.status}`);

        }

        return attachment.id;

      } 
      catch (error) {

        console.error(`Failed to upload ${attachment.filename}:`, error);
        throw error;

      }

    });

    const uploadedIds = await Promise.all(uploadPromises);
    return uploadedIds;

  } 
  catch (error) {

    console.error('Upload process failed:', error);
    throw error;

  }
  
}