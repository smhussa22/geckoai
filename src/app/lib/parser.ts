import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import { randomUUID } from "node:crypto";

export type RawDocument = {
    s3Id: string;
    source: "pdf" | "pptx";
    docId: string;
    page: number;
    text: string;
    tokensApprox?: number;
};

const token = 4;

const xmlParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    trimValues: true,
});

export async function parsePdfRaw(
    buffer: Buffer,
    options?: { docId?: string }
): Promise<{ docId: string; chunks: RawDocument[] }> {
    const docId = options?.docId ?? randomUUID();

    console.log("PDF parsing - attempting basic text extraction from buffer:", buffer.length);

    try {
        // Try to extract any readable text from the PDF buffer
        let text = "";

        // Convert buffer to string and look for text patterns
        const bufferStr = buffer.toString("binary");

        // Basic PDF text extraction - look for text between parentheses and other common patterns
        const textMatches = bufferStr.match(/\((.*?)\)/g) || [];
        const streamMatches = bufferStr.match(/stream([\s\S]*?)endstream/g) || [];

        // Extract text from parentheses (common in PDF text objects)
        textMatches.forEach((match) => {
            const cleaned = match
                .slice(1, -1) // Remove parentheses
                .replace(/\\n/g, "\n")
                .replace(/\\r/g, "\r")
                .replace(/\\t/g, "\t")
                .replace(/\\\\/g, "\\");
            if (cleaned.length > 2 && /[a-zA-Z]/.test(cleaned)) {
                text += cleaned + " ";
            }
        });

        // Try to extract text from streams (more complex, but sometimes works)
        streamMatches.forEach((match) => {
            const streamContent = match.slice(6, -9); // Remove 'stream' and 'endstream'
            // Look for readable text in streams
            const readableText = streamContent
                .replace(/[^\x20-\x7E\n\r\t]/g, " ")
                .replace(/\s+/g, " ")
                .trim();
            if (readableText.length > 10 && /[a-zA-Z]{3,}/.test(readableText)) {
                text += readableText + " ";
            }
        });

        // Clean up the extracted text
        text = text.trim().replace(/\s+/g, " ");

        if (!text) {
            text =
                "[PDF file detected but text extraction not available - please use a proper PDF parser]";
        }

        console.log("Basic PDF text extraction completed, text length:", text.length);

        return {
            docId,
            chunks: [
                {
                    s3Id: `${docId}:pdf:1`,
                    source: "pdf",
                    docId,
                    page: 1,
                    text: text,
                    tokensApprox: Math.round(text.length / token),
                },
            ],
        };
    } catch (error) {
        console.error("Error in basic PDF text extraction:", error);
        return {
            docId,
            chunks: [
                {
                    s3Id: `${docId}:pdf:1`,
                    source: "pdf",
                    docId,
                    page: 1,
                    text: "[PDF file uploaded but could not be parsed]",
                    tokensApprox: 1,
                },
            ],
        };
    }
}

export async function parsePptxRaw(
    buffer: Buffer,
    options?: { docId?: string }
): Promise<{ docId: string; chunks: RawDocument[] }> {
    const docId = options?.docId ?? randomUUID();

    try {
        if (!Buffer.isBuffer(buffer)) {
            throw new Error("Invalid buffer provided to parsePptxRaw");
        }

        console.log("Parsing PPTX buffer of size:", buffer.length);

        const zip = await JSZip.loadAsync(buffer);

        const slidePaths = Object.keys(zip.files)
            .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
            .sort(
                (a, b) =>
                    parseInt(a.match(/(\d+)\.xml$/)![1], 10) -
                    parseInt(b.match(/(\d+)\.xml$/)![1], 10)
            );

        const chunks: RawDocument[] = [];

        for (const [i, path] of slidePaths.entries()) {
            try {
                const slideXml = await zip.file(path)!.async("string");
                const slideJson = xmlParser.parse(slideXml);

                const text = extractAllText(slideJson);

                chunks.push({
                    s3Id: `${docId}:pptx:${i + 1}`,
                    source: "pptx",
                    docId,
                    page: i + 1,
                    text,
                    tokensApprox: Math.round(text.length / token),
                });
            } catch (slideError) {
                console.error(`Error parsing slide ${i + 1}:`, slideError);
                chunks.push({
                    s3Id: `${docId}:pptx:${i + 1}`,
                    source: "pptx",
                    docId,
                    page: i + 1,
                    text: `[Error parsing slide ${i + 1}]`,
                    tokensApprox: 1,
                });
            }
        }

        console.log("PPTX parsed successfully, slides:", chunks.length);
        return { docId, chunks };
    } catch (error) {
        console.error("Error parsing PPTX:", error);
        return {
            docId,
            chunks: [
                {
                    s3Id: `${docId}:pptx:1`,
                    source: "pptx",
                    docId,
                    page: 1,
                    text: "[PPTX parsing failed]",
                    tokensApprox: 1,
                },
            ],
        };
    }
}

function extractAllText(json: any): string {
    if (typeof json === "string") return json;
    if (Array.isArray(json)) return json.map(extractAllText).join(" ");
    if (typeof json === "object" && json !== null)
        return Object.values(json).map(extractAllText).join(" ");
    return "";
}
