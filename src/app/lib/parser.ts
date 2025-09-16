import JSZip from "jszip";
import { XMLParser } from "fast-xml-parser";
import { randomUUID } from "node:crypto";
import PdfParse from "pdf-parse";

export type RawDocument = {

    s3Id: string;
    source: "pdf" | "pptx";
    docId: string;
    page: number;
    text: string;
    tokensApprox?: number;

};

const token = 4;

const TOKENS_PER_CHAR = 4;

// skeleton parser functions
export async function parsePdfRaw(
  buffer: Buffer,
  options?: { docId?: string }
): Promise<{ docId: string; chunks: RawDocument[] }> {
  const docId = options?.docId ?? randomUUID();

  return {
    docId,
    chunks: [
      {
        s3Id: `${docId}:pdf:1`,
        source: "pdf",
        docId,
        page: 1,
        text: "[PDF parsing not implemented yet]",
        tokensApprox: 1,
      },
    ],
  };
}

export async function parsePptxRaw(
  buffer: Buffer,
  options?: { docId?: string }
): Promise<{ docId: string; chunks: RawDocument[] }> {
  const docId = options?.docId ?? randomUUID();

  return {
    docId,
    chunks: [
      {
        s3Id: `${docId}:pptx:1`,
        source: "pptx",
        docId,
        page: 1,
        text: "[PPTX parsing not implemented yet]",
        tokensApprox: 1,
      },
    ],
  };
}
