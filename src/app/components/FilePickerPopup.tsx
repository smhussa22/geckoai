'use client';
import React, { useRef } from 'react';
import { RiUploadCloud2Line } from 'react-icons/ri';

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (files: File[]) => void;
  accept?: string;
  className?: string;
};

export default function FilePickerPopup({ open, onClose, onPick, accept }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  const chooseFiles = () => inputRef.current?.click();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length) onPick(files);
    e.target.value = '';
    onClose();
  };

  return (
    <div
      className={`absolute bottom-0 left-12 z-50 flex w-60 rounded-md border border-neutral-700 bg-neutral-900 p-3 shadow-xl`}
    >
      <button
        onClick={chooseFiles}
        className="text-ghost flex w-full flex-col items-center justify-center rounded-md border border-neutral-600 bg-neutral-800 px-3 py-2 text-left hover:text-neutral-700"
      >
        <RiUploadCloud2Line size={64} />
        Click To Upload Files
      </button>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        onChange={onChange}
        className="hidden"
      />
    </div>
  );
}
