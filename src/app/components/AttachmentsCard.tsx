"use client";
import React from "react";
import { SiAdobeacrobatreader } from "react-icons/si";
import { CiCircleRemove, CiImageOn, CiFileOn } from "react-icons/ci";
import { BsFileEarmarkSpreadsheet } from "react-icons/bs";
import { HiOutlinePresentationChartLine, HiOutlineDocumentText } from "react-icons/hi2";

const pickIconFromName = (name: string) => {
    const ext = (name.split(".").pop() || "").toLowerCase();

    if (ext === "pdf") return SiAdobeacrobatreader;
    if (["csv", "xlsx", "xls"].includes(ext)) return BsFileEarmarkSpreadsheet;
    if (["png", "jpg", "jpeg", "webp"].includes(ext)) return CiImageOn;
    if (ext === "pptx") return HiOutlinePresentationChartLine;
    if (["doc", "docx", "txt", "md"].includes(ext)) return HiOutlineDocumentText;
    return CiFileOn;
};

const handleDelete =
    (index: number, onRemove?: (index: number) => void) =>
    (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove?.(index);
    };

export default function AttachmentsCard({
    items = [],
    onRemove,
    className = "",
}: {
    items?: string[];
    onRemove?: (index: number) => void;
    className?: string;
}) {
    if (!items.length) return null;

    return (
        <div className={`mb-2 w-full ${className}`}>
            <div className="flex flex-wrap justify-start gap-2">
                {items.map((label, i) => {
                    const Icon = pickIconFromName(label);

                    return (
                        <div
                            className="group text-ghost relative inline-flex max-w-60 items-center gap-2 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-2 text-xs"
                            key={`${label}-${i}`}
                            title={label}
                        >
                            <span className="grid shrink-0 place-items-center p-1">
                                <Icon size={24} className="text-neutral-500" />
                            </span>

                            <span className="truncate text-sm">{label}</span>

                            <button type="button" onClick={handleDelete(i, onRemove)}>
                                <CiCircleRemove
                                    size={24}
                                    className="text-neutral-400 drop-shadow transition-colors hover:text-neutral-200"
                                />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
