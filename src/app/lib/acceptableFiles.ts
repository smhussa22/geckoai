export const acceptableFiles = [
    ".pdf",
    ".doc",
    ".docx",
    ".txt",

    ".png",
    ".jpg",
    ".jpeg",
    ".webp",

    ".pptx",
].join(",");

const maxFileSizeInMegabytes = 50;

export const maxFileSizeInBytes = maxFileSizeInMegabytes * 1024 * 1024;
export const maxFilesPerMessage = 5;

export const documentTypes = [".pdf", ".doc", ".docx", ".txt"];
export const imageTypes = [".png", ".jpg", ".jpeg", ".webp"];
export const presentationTypes = [".pptx"];
