"use client";
export type ViewMode = "chat" | "calendar";

export default function ViewToggle({
  view,
  onChange,
  className = "",
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
  className?: string;
}) {
  return (
    <div className={`inline-flex overflow-hidden rounded-md border border-neutral-800 bg-neutral-900 ${className}`}>
      <button
        type="button"
        onClick={() => onChange("chat")}
        aria-pressed={view === "chat"}
        className={`px-3 py-1 text-sm font-medium transition ${view === "chat" ? "bg-asparagus text-black" : "text-neutral-300 hover:bg-neutral-800"}`}
      >
        Chat
      </button>
      <button
        type="button"
        onClick={() => onChange("calendar")}
        aria-pressed={view === "calendar"}
        className={`px-3 py-1 text-sm font-medium transition ${view === "calendar" ? "bg-asparagus text-black" : "text-neutral-300 hover:bg-neutral-800"}`}
      >
        Calendar
      </button>
    </div>
  );
}
