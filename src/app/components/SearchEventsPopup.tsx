"use client";
import React, { useState } from "react";
import { BsXCircle, BsX } from "react-icons/bs";
import { TbCalendarDot } from "react-icons/tb";

type EventItem = {

    id: string;
    name: string;
    description: string;
    backgroundColor: string;
    textColor: string;

};

const initialEvents: EventItem[] = [

    { id: "1", name: "Design Sync", description: "Discuss the event card layout and colors.", backgroundColor: "#a78bfa", textColor: "#0b0f0a" },
    { id: "2", name: "Sprint Planning", description: "Finalize scope for Sprint 14 and assign owners.", backgroundColor: "#38bdf8", textColor: "#0b0f0a" },
    { id: "3", name: "QA Triage", description: "Review open bugs and set priorities for fixes.", backgroundColor: "#22c55e", textColor: "#0b0f0a" },

];

export default function SearchEventsPopup({ onClose }: { onClose?: () => void }) {

	const [activeTab, setActiveTab] = useState<"all" | "upcoming" | "past">("all");
	const [search, setSearch] = useState("");
	const [events, setEvents] = useState<EventItem[]>(initialEvents);
	const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

	const filtered = events.filter((e) => {

      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return e.name.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);

	});

	const toggleExpand = (id: string) => {

      setExpandedIds((prev) => {

        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;

      });

	};

  const removeEvent = (id: string) => {

		setEvents((prev) => prev.filter((e) => e.id !== id));

	  setExpandedIds((prev) => {

        const next = new Set(prev);
        next.delete(id);
        return next;

		});

	};

    return (

      <div className="w-full space-y-4">

        <div className="flex relative">

          <div>

            <h1 className="text-2xl font-bold tracking-tighter text-cyan-700">Search Events</h1>
            <h2 className="font-semibold tracking-tighter text-cyan-800">Search the events in this calendar.</h2>

          </div>

          <button onClick={onClose} className="absolute right-0 text-neutral-700 transition-colors duration-200 hover:text-neutral-600">

            <BsXCircle size={25} />

          </button>

        </div>

        <div className="inline-flex gap-2 rounded-lg bg-neutral-800 p-1">

          <button
            onClick={() => setActiveTab("all")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "all" ? "bg-neutral-700 text-white" : "text-neutral-300 hover:text-white hover:bg-neutral-700/50"}`}
          >

            All

          </button>

          <button

            onClick={() => setActiveTab("upcoming")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "upcoming" ? "bg-neutral-700 text-white" : "text-neutral-300 hover:text-white hover:bg-neutral-700/50"}`}
          
          >

            Upcoming

          </button>

          <button

            onClick={() => setActiveTab("past")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === "past" ? "bg-neutral-700 text-white" : "text-neutral-300 hover:text-white hover:bg-neutral-700/50"}`}
          
          >

            Past

          </button>

        </div>

        <div>

          <input

            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoCapitalize="off"
            spellCheck={false}
            autoCorrect="off"
            placeholder="Search calendars…"
            className="tracking-tighter p-2 bg-neutral-800 text-asparagus placeholder-neutral-600 rounded-md border border-neutral-700 focus:outline-none focus:ring-1 focus:ring-broccoli w-full"
            type="text"

          />

        </div>

        <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-2">

          {filtered.length === 0 ? (

            <div className="text-neutral-400 text-sm tracking-tight p-2">No events found.</div>

          ) : (
            
            <div className="flex flex-col gap-1">

              {filtered.map((ev) => {

                const expanded = expandedIds.has(ev.id);

                return (

                  <div key={ev.id} className="relative">

                    <button

                      onClick={() => toggleExpand(ev.id)}
                      className="w-full rounded-md border transition-opacity duration-150 hover:opacity-95 text-left"
                      style={{ backgroundColor: ev.backgroundColor, color: ev.textColor, borderColor: "rgba(0,0,0,0.2)" }}

                    >

                      <div className="p-2">

                        <div className="flex items-start gap-2">

                          <span className="h-5 w-5 shrink-0 flex items-center justify-center">

                            <TbCalendarDot size={18} />

                          </span>

                          <div className="min-w-0">

                            <div

                              className={`tracking-tighter font-semibold leading-tight ${expanded ? "" : "overflow-hidden whitespace-nowrap text-ellipsis"}`}
                              title={ev.name}
                              style={{ color: ev.textColor }}

                            >

                              {ev.name}

                            </div>

                            <div

                              className={`text-sm leading-snug transition-[max-height,opacity,margin] duration-200 ease-out ${
                                expanded ? "max-h-40 opacity-100 mt-1" : "max-h-0 opacity-0 -mt-1"
                              }`}
                              style={{ color: ev.textColor }}

                            >

                              {ev.description}

                            </div>

                          </div>

                        </div>

                      </div>

                    </button>

                    <button

                      onClick={() => removeEvent(ev.id)}
                      className="absolute right-1 top-1 rounded-md p-1 transition-colors"
                      style={{ color: ev.textColor, backgroundColor: "rgba(0,0,0,0.08)" }}

                    >

                      <BsX size={18} />

                    </button>

                  </div>

                );

              })}

            </div>

          )}

        </div>

      </div>

    );

}
