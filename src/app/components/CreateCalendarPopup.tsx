// CreateCalendarPage.tsx
"use client";
import React, { useState } from "react";
import { Tooltip } from "react-tooltip";
import { LuCalendarPlus } from "react-icons/lu";
import { BsXCircle } from "react-icons/bs";
import TimeZoneSelect from "./TimeZoneSelect";

export default function CreateCalendarPage({ onClose }: { onClose?: () => void }) {

  const [nameVal, setNameVal] = useState("");
  const [nameFocused, setNameFocused] = useState(false);
  const [nameTouched, setNameTouched] = useState(false);
  const [descVal, setDescVal] = useState("");
  const [descFocused, setDescFocused] = useState(false);
  const [timeZone, setTimeZone] = useState("");                 
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const nameError = nameTouched && !nameVal.trim();

  const handleCreate = async () => {

    setErrorMsg(null);

    if (!nameVal.trim() || !timeZone) {

      setNameTouched(true);
      setErrorMsg("Name and time zone are required.");
      return;

    }

    setSubmitting(true);

    try {

      const res = await fetch("/api/calendars", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          summary: nameVal.trim(),
          description: descVal,
          timeZone,
        }),

      });

      const data = await res.json().catch(() => null);
      if (!res.ok) throw new Error(data?.error || res.statusText || "Failed to create calendar");

      
      onClose?.();

    } catch (e: any) {

      setErrorMsg(e?.message || "Failed to create calendar.");

    } finally {

      setSubmitting(false);

    }

  }

  return (

    <>

      <div className="flex relative">
      
              <div>
      
                <h1 className="text-2xl font-bold tracking-tighter text-asparagus">Create Calendar</h1>
                <h2 className="mb-2 font-semibold tracking-tighter text-broccoli">Conveniently create a new Google calendar.</h2>
      
              </div>
      
              <button onClick={onClose} className="absolute right-0 text-neutral-700 mb-5 transition-colors duration-200 hover:text-neutral-600">
              
                <BsXCircle size={25} />
              
              </button>
      
            </div>

      <div className="relative mt-4">

        <input
          type="text"
          value={nameVal}
          onChange={(e) => setNameVal(e.target.value)}
          onFocus={() => setNameFocused(true)}
          onBlur={() => { setNameFocused(false); setNameTouched(true); }}
          placeholder=" "
          autoCapitalize="off"
          spellCheck={false}
          autoCorrect="off"
          maxLength={40}
          className={`w-full bg-neutral-800 rounded-md p-3 pt-5 text-neutral-200 placeholder-white outline-none border-b-2 transition-all ${
            nameError ? "border-red-700" : nameVal ? "border-asparagus" : nameFocused ? "border-neutral-700" : "border-transparent"
          }`}
        />

        <label className={`absolute left-3 transition-all flex items-center gap-1 ${nameFocused || nameVal ? "top-1 text-xs" : "top-3 text-base"} text-white`}>

          <span>Calendar Name</span>

          {!nameVal && (

            <span className="text-red-700" data-tooltip-id="asterisk" data-tooltip-content="This is a required field.">*</span>

          )}

          <Tooltip id="asterisk" place="right" opacity={1} style={{ marginLeft: "0.5rem", backgroundColor: "#131112", padding: "0.4rem", borderRadius: "0.375rem", color: "#b91c1c", zIndex: 50 }} noArrow />

        </label>

        <div className="h-5 mt-1 text-sm">{nameError && <span className="text-red-700">You must enter a calendar name.</span>}</div>

      </div>

      <div className="relative w-100 mt-2">

        <textarea
          value={descVal}
          onChange={(e) => setDescVal(e.target.value)}
          onFocus={() => setDescFocused(true)}
          onBlur={() => setDescFocused(false)}
          placeholder=" "
          autoCapitalize="off"
          spellCheck={false}
          autoCorrect="off"
          maxLength={50}
          className={`w-full bg-neutral-800 rounded-md p-3 pt-5 text-neutral-200 placeholder-white outline-none border-b-2 transition-colors h-24 resize-none ${
            descVal ? "border-asparagus" : descFocused ? "border-neutral-700" : "border-transparent"
          }`}
        />

        <label className={`absolute left-3 pointer-events-none transition-all ${descFocused || descVal ? "top-1 text-xs" : "top-3 text-base"} text-white`}>

          Calendar Description

        </label>

      </div>

      <div className="relative mt-6">

        <label className="absolute left-3 top-1 text-xs text-white pointer-events-none">Time Zone</label>

        <TimeZoneSelect value={timeZone} onChange={setTimeZone} />

      </div>

      {errorMsg && <p className="mt-3 text-sm text-red-600">{errorMsg}</p>}

      <button
        onClick={handleCreate}
        disabled={submitting}
        className="mt-8 w-full inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-broccoli text-night font-semibold py-3 hover:bg-night text-2xl hover:text-broccoli transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >

        <LuCalendarPlus size={35} />
        {submitting ? "Creating..." : "Create New Calendar"}

      </button>

    </>

  );

}
