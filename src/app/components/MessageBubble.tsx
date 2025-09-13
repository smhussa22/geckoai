'use client';
import React from 'react';
import { FaRegFilePdf, FaRegFileAlt, FaRegFile } from 'react-icons/fa';
import { FaRegFileImage } from 'react-icons/fa6';
import { BsFiletypeTxt, BsFiletypeCsv } from 'react-icons/bs';

type Attachment = {
  id: string;
  name: string;
  url: string;
  mime?: string;
};

export default function MessageBubble({
  role,
  children,
  attachments = [],
}: {
  role: 'user' | 'assistant';
  children: React.ReactNode;
  attachments?: Attachment[];
}) {
  const isUser = role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="flex max-w-150 gap-2 tracking-tighter">
        {!isUser && <img src="/logoAnimated.svg" className="h-11 w-11 rounded-full p-1.5" />}

        <div className={`flex w-full flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
          {attachments.length > 0 && (
            <div className="flex w-full flex-col gap-2">
              {attachments.map((a) => (
                <AttachmentCard key={a.id} file={a} align={isUser ? 'right' : 'left'} />
              ))}
            </div>
          )}

          <div
            className={`text-ghost whitespace-no-wrap rounded-md p-3 break-words ${isUser && 'border border-neutral-700 bg-neutral-800'}`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

const pickIcon = (mime?: string, name?: string) => {
  const m = (mime || '').toLowerCase();
  const ext = (name?.toLowerCase().split('.').pop() || '').trim();

  if (m.includes('pdf') || ext === 'pdf') return FaRegFilePdf;
  if (m.startsWith('image/') || ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(ext))
    return FaRegFileImage;
  if (m.includes('csv') || ext === 'csv') return BsFiletypeCsv;
  if (m.includes('plain') || ['txt', 'log'].includes(ext)) return BsFiletypeTxt;
  if (['doc', 'docx'].includes(ext) || m.includes('word')) return FaRegFileAlt;

  return FaRegFile;
};

function AttachmentCard({ file, align = 'left' }: { file: Attachment; align?: 'left' | 'right' }) {
  const Icon = pickIcon(file.mime, file.name);

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noreferrer"
      title={file.name}
      className={`flex max-w-[360px] items-center gap-2 rounded-md border border-neutral-700 bg-neutral-800 px-2 py-1 text-xs text-neutral-200 ${align === 'right' ? 'self-end' : 'self-start'}`}
    >
      <Icon size={14} className="shrink-0 text-neutral-300" />
      <span className="truncate">{file.name}</span>
    </a>
  );
}
