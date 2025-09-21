"use client";
import React, { useRef, useState, useEffect } from "react";
import { RiUploadCloud2Line } from "react-icons/ri";
import { X, Trash2 } from "lucide-react";
import { acceptableFiles, maxFileSizeInBytes, maxFilesPerMessage } from "@/lib/acceptableFiles";

type Props = {
    open: boolean;
    onClose: () => void;
    onPick: (files: File[]) => void;
    accept?: string;
    className?: string;
    remainingSlots?: number;
};

const extensionOf = (name: string) =>
    name.lastIndexOf(".") >= 0 ? name.slice(name.lastIndexOf(".")).toLowerCase() : "";

const formatToMegabytes = (bytes: number) => (bytes / 1048576).toFixed(1);

export default function FilePickerPopup({
    open,
    onClose,
    onPick,
    accept = acceptableFiles,
    className = "",
    remainingSlots = maxFilesPerMessage,
}: Props) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [staged, setStaged] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setStaged([]);
            setErrorMsg(null);
            setIsDragging(false);
        }
    }, [open]);

    useEffect(() => {
        if (!errorMsg) return;
        const timeout = setTimeout(() => setErrorMsg(null), 4000);
        return () => clearTimeout(timeout);
    }, [errorMsg]);

    if (!open) return null;

    const chooseFiles = () => inputRef.current?.click();

    const addFiles = (files: File[]) => {
        console.log("[FilePickerPopup] Adding files:", files);
        const accepted: File[] = [];
        const rejected: string[] = [];
        const seen = new Set(
            staged.map((file) => `${file.name}:${file.size}:${file.lastModified}`)
        );
        const available = Math.max(0, remainingSlots - staged.length);
        const allowedExts = acceptableFiles
            .split(",")
            .map((staged) => staged.trim().toLowerCase())
            .filter(Boolean);

        for (const file of files) {
            const key = `${file.name}:${file.size}:${file.lastModified}`;
            const extension = extensionOf(file.name);
            const hasSlots = accepted.length < available;
            const isDuplicate = seen.has(key);
            const isAllowed = allowedExts.includes(extension);
            const isTooLarge = file.size > maxFileSizeInBytes;

            if (!hasSlots) {
                rejected.push(`${file.name} — limit reached (max ${maxFilesPerMessage})`);
            } else if (!isDuplicate && !isAllowed) {
                rejected.push(`${file.name} — unsupported ${extension || "(none)"}`);
            } else if (!isDuplicate && isAllowed && isTooLarge) {
                rejected.push(`${file.name} — too large (${formatToMegabytes(file.size)} MB)`);
            } else if (!isDuplicate && isAllowed && !isTooLarge) {
                seen.add(key);
                accepted.push(file);
            }
        }

        if (rejected.length) {
            const msg =
                `Skipped ${rejected.length} file${rejected.length > 1 ? "s" : ""}:\n` +
                rejected.slice(0, 6).join("\n") +
                (rejected.length > 6 ? `\n+${rejected.length - 6} more` : "");
            setErrorMsg(msg);
        }
        if (accepted.length) setStaged((prev) => [...prev, ...accepted]);
    };

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        addFiles(Array.from(e.target.files || []));
        e.target.value = "";
    };

    const shield = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const items = Array.from(e.dataTransfer?.files || []);
        if (items.length) addFiles(items);
    };

    const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
    };

    const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const removeAt = (idx: number) => {
        setStaged((prev) => prev.filter((_, i) => i !== idx));
    };

    const clearAll = () => setStaged([]);

    const confirmAdd = () => {
        console.log("[FilePickerPopup] Confirming staged:", staged);
        if (staged.length === 0) return;
        const available = Math.max(0, remainingSlots);
        const toSend = staged.slice(0, available);
        console.log("[FilePickerPopup] Sending to parent:", toSend);
        onPick(toSend);
        setStaged([]);
        onClose();
    };

    const slotsLeft = Math.max(0, remainingSlots - staged.length);

    return (
        <div className="fixed inset-0 z-50 grid place-items-center">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
                onDragEnter={shield}
                onDragOver={shield}
                onDragLeave={shield}
                onDrop={shield}
            />
            <div
                className={`relative w-full max-w-2xl rounded-2xl border border-neutral-700 bg-neutral-900 shadow-2xl ${className}`}
                onDragEnter={shield}
                onDragOver={shield}
                onDrop={shield}
            >
                <div className="flex items-center justify-between border-b border-neutral-800 p-4">
                    <h3 className="text-lg font-semibold text-neutral-100">
                        Add files{" "}
                        <span className="ml-2 text-xs font-normal text-neutral-400">
                            (File uploads left: {slotsLeft})
                        </span>
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-md p-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {errorMsg && (
                    <div
                        role="status"
                        aria-live="polite"
                        className="mx-4 mt-3 rounded-md border border-red-500/50 bg-red-500/15 p-3 text-sm text-red-200"
                    >
                        <span className="font-semibold">Upload error:&nbsp;</span>
                        <span className="whitespace-pre-line">{errorMsg}</span>
                    </div>
                )}

                <div className="p-4">
                    <div
                        onDragOver={onDragOver}
                        onDragLeave={onDragLeave}
                        onDrop={onDrop}
                        onClick={chooseFiles}
                        className={`grid h-40 place-items-center rounded-xl border-2 border-dashed transition-colors ${
                            isDragging
                                ? "border-asparagus bg-asparagus/10"
                                : "border-neutral-700 bg-neutral-900"
                        } cursor-pointer`}
                    >
                        <div className="flex flex-col items-center text-neutral-300">
                            <RiUploadCloud2Line size={48} className="mb-2" />
                            <div className="text-sm">
                                <span className="font-medium text-neutral-100">Drag & drop</span> or
                                click to browse
                            </div>
                            <div className="mt-1 text-xs text-neutral-400">
                                Accepted: {acceptableFiles} • Max{" "}
                                {formatToMegabytes(maxFileSizeInBytes)} MB • Up to{" "}
                                {maxFilesPerMessage} files
                            </div>
                        </div>
                    </div>

                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        accept={accept}
                        onChange={onChange}
                        className="hidden"
                    />

                    {staged.length > 0 && (
                        <div className="mt-4">
                            <div className="mb-2 flex items中心 justify-between">
                                <div className="text-sm text-neutral-300">
                                    Staged ({staged.length})
                                </div>
                                <button
                                    onClick={clearAll}
                                    className="rounded-md p-2 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
                                >
                                    Clear all
                                </button>
                            </div>
                            <div className="max-h-60 space-y-2 overflow-y-auto p-1">
                                {staged.map((f, i) => (
                                    <div
                                        key={`${f.name}:${f.size}:${f.lastModified}`}
                                        className="flex items-center justify-between rounded-md border border-neutral-800 bg-neutral-900 p-2"
                                    >
                                        <div className="min-w-0">
                                            <div className="truncate text-sm text-neutral-100">
                                                {f.name}
                                            </div>
                                            <div className="text-xs text-neutral-400">
                                                {formatToMegabytes(f.size)} MB •{" "}
                                                {extensionOf(f.name) || "unknown"}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeAt(i)}
                                            className="ml-3 rounded-md p-2 text-neutral-400 hover:bg-neutral-800 hover:text-neutral-100"
                                            aria-label={`Remove ${f.name}`}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-neutral-800 p-4">
                    <button
                        onClick={onClose}
                        className="rounded-md p-2 text-sm text-neutral-300 hover:bg-neutral-800"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={confirmAdd}
                        disabled={staged.length === 0}
                        className={`rounded-md p-2 text-sm font-semibold ${
                            staged.length > 0
                                ? "bg-asparagus text-night hover:brightness-110"
                                : "bg-neutral-800 text-neutral-500"
                        }`}
                    >
                        Add {staged.length || ""} {staged.length === 1 ? "file" : "files"}
                    </button>
                </div>
            </div>
        </div>
    );
}
