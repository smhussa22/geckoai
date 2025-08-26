"use client";
import React, { useMemo, useState } from "react";
import { BsXCircle } from "react-icons/bs";
import { AiFillDelete } from "react-icons/ai";
import { useCalendar } from "../contexts/SelectedCalendarContext";

export default function DeleteEventPopup({ onClose }: { onClose?: () => void }) {

	const { calendar, setCalendar } = useCalendar();
	const [confirmText, setConfirmText] = useState("");
	const [errorMsg, setErrorMsg] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	const canDelete = calendar!.summary === confirmText;

	const handleDelete = async () => {

		setErrorMsg(null);

		if (!calendar) {

			setErrorMsg("No calendar selected.");
			return;

		}

		if (!canDelete) {

			setErrorMsg("You must type the calendar’s exact name to delete it.");
			return;

		}

		setSubmitting(true);

		try {

			const response = await fetch("/api/calendars", {

      			method: "DELETE",
      			headers: { "Content-Type": "application/json" },
      			body: JSON.stringify({ calendarId: calendar.id }), 
    
			});

			if (!response.ok) {
      		
				let msg = `Error: ${response.status}`;
      		
				try {
        
					const data = await response.json();
					msg = data?.error || msg;
      			} catch {}

      			throw new Error(msg);
    			
			}
		
			setCalendar(null);
			onClose?.();

		} 
		catch (error: any) {

			setErrorMsg(error?.message || "Failed to delete calendar.");

		} 
		finally {

			setSubmitting(false);

		}

	};

	return (

		<div className="w-full">

			<div className="flex relative">
			
				<div>
			
					<h1 className="text-2xl font-bold tracking-tighter text-asparagus">Delete Calendar</h1>
					<h2 className="mb-2 font-semibold tracking-tighter text-broccoli">This action cannot be undone.</h2>

				</div>

				<button type="button" onClick={onClose} className="absolute right-0 text-neutral-700 mb-5 transition-colors duration-200 hover:text-neutral-600" >
			
					<BsXCircle size={25} />
			
				</button>

			</div>

			<div className="mt-3 rounded-xl border border-red-900/50 bg-red-900/10 p-4">
			
				<div className="flex items-start gap-3">

					<div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-900/20 text-red-500">

						<AiFillDelete size={22} />
				
					</div>

					<div className="space-y-1">

						<p className="text-red-400 font-semibold tracking-tighter">You’re about to permanently delete this calendar.</p>
						<p className="text-neutral-300 text-sm tracking-tight">All events on this calendar will be removed. Shared access will be revoked.</p>
			
					</div>

				</div>

			</div>

			{ errorMsg && ( <div role="alert" className="mt-3 rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-red-300 text-sm"> {errorMsg} </div> ) }

			<div className="mt-5">

				<p className="tracking-tighter font-semibold text-asparagus">To unlock this action, type the calendar’s name below.</p>
			
				<input
				type="text"
				value={confirmText}
				onChange={(e) => setConfirmText(e.target.value)}
				placeholder={calendar ? `Type “${calendar.summary}” to confirm` : "No calendar selected"}
				autoCapitalize="off"
				spellCheck={false}
				autoCorrect="off"
				disabled={submitting || !calendar}
				className="mt-2 w-full bg-transparent text-lg text-ghost outline-none border-b-2 pb-2 transition-colors placeholder-neutral-500 border-neutral-700 focus:border-neutral-600 disabled:opacity-60"
				/>

			</div>

			<div className="mt-6 flex items-center gap-3">

				<button
				type="button"
				onClick={onClose}
				className="w-1/2 h-12 flex items-center justify-center rounded-lg bg-neutral-700 text-night font-bold px-4 text-xl tracking-tighter transition-colors duration-200 hover:bg-night hover:text-neutral-700 disabled:opacity-60"
				disabled={submitting}
				>

					<span className="relative flex items-center">Cancel</span>

				</button>

				<button
				type="button"
				onClick={handleDelete}
				className={`group w-1/2 h-12 flex items-center justify-center rounded-lg font-bold px-4 text-xl tracking-tighter transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed ${
					canDelete ? "hover:bg-night hover:text-red-900 bg-red-900 text-night" : "bg-neutral-800"
				}`}
				disabled={!canDelete || submitting}
				>

					<span className="relative flex items-center">

						{canDelete && (

							<span className="overflow-hidden inline-flex w-0 group-hover:w-9 transition-all duration-300 ease-out">
							
								<AiFillDelete size={32} className="mb-0.5 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out" />

							</span>

						)}

						<span className={`ml-0 ${canDelete ? "group-hover:ml-2" : ""} transition-all duration-300`}> {submitting ? "Deleting…" : "Delete"} </span>

					</span>
				
				</button>

			</div>

		</div>

	);
	
}
