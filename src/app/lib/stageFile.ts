"use client";
import { useCallback, useMemo, useState } from "react";

export type StagedFile = {

    file: File;
    name: string;
    type: string;
    size: number;
    
};

export function useStagedFiles() {

    const [staged, setStaged] = useState<StagedFile[]>([]);

    const add = useCallback((files: File[]) => {

        if (!files?.length) return;
        
            setStaged(prev => [
            ...prev,
            ...files.map(f => ({
                file: f,
                name: f.name,
                type: f.type || "application/octet-stream",
                size: f.size,
            })),
        ]);
    }, []);

    const removeAt = useCallback((index: number) => {

        setStaged(prev => prev.toSpliced(index, 1)); 
        
    }, []);

    const clearAll = useCallback(() => setStaged([]), []);

    const names = useMemo(() => staged.map(s => s.name), [staged]);
    const files = useMemo(() => staged.map(s => s.file), [staged]);
    const totalBytes = useMemo(() => staged.reduce((n, s) => n + s.size, 0), [staged]);

    return { staged, names, files, totalBytes, add, removeAt, clearAll };

}
