"use client";
import React, { useState } from "react";
import { BsXCircle } from "react-icons/bs";
import { MdClearAll } from "react-icons/md";

export default function ClearEventPopup({ onClose }: { onClose?: () => void }) {

	const [confirmText, setConfirmText] = useState("");
	const canDelete = confirmText.trim().length > 0;

	return (

		<div className="w-full">

			<div className="flex relative">

				<div>

					<h1 className="text-2xl font-bold tracking-tighter text-asparagus">Clear Events</h1>
					<h2 className="mb-2 font-semibold tracking-tighter text-broccoli">This action cannot be undone.</h2>

				</div>

				<button onClick={onClose} className="absolute right-0 text-neutral-700 mb-5 transition-colors duration-200 hover:text-neutral-600">

					<BsXCircle size={25} />

				</button>

			</div>

			<div className="mt-3 rounded-xl border border-amber-700/50 bg-amber-700/10 p-4">

				<div className="flex items-start gap-3">

					<div className="h-10 w-10 flex items-center justify-center rounded-full bg-amber-700/20 text-amber-300">

						<MdClearAll size={22} />

					</div>

					<div className="space-y-1">
						
						<p className="text-amber-400 font-semibold tracking-tighter">You’re about to permanently clear this calendar of its events.</p>
						<p className="text-neutral-300 text-sm tracking-tight">All events that populate this calendar will be removed.</p>

					</div>

				</div>

			</div>

			<div className="mt-5">

				<p className="tracking-tighter font-semibold text-asparagus">To unlock this action, type the calendar’s name below.</p>

				<input
					type="text"
					value={confirmText}
					onChange={(e) => setConfirmText(e.target.value)}
					placeholder="Type calendar name to confirm"
					autoCapitalize="off"
					spellCheck={false}
					autoCorrect="off"
					className="mt-2 w-full bg-transparent text-lg text-ghost outline-none border-b-2 pb-2 transition-colors placeholder-neutral-500 border-neutral-700 focus:border-neutral-600"
				/>

			</div>

			<div className="mt-6 flex items-center gap-3">

				<button onClick = {onClose}
					className="w-1/2 h-12.5 flex items-center justify-center rounded-lg bg-neutral-700 text-night font-bold py-2 px-4 text-xl tracking-tighter transition-colors duration-200 hover:bg-night hover:text-neutral-700 disabled:opacity-60 disabled:cursor-not-allowed"
				>

					<span className="relative flex items-center">

						Cancel

					</span>

				</button>

				<button

					className={`group w-1/2 flex items-center justify-center rounded-lg ${canDelete ? 'hover:bg-night hover:text-amber-700 bg-amber-700 text-night' : 'bg-neutral-800 h-12.5'} font-bold py-2 px-4 text-xl tracking-tighter transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed`}
					disabled={!canDelete}

				>

					<span className="relative flex items-center">

						{ canDelete && (

							<span className="overflow-hidden inline-flex w-0 group-hover:w-9 transition-all duration-300 ease-out">

								<MdClearAll
									size={32}
									className="mb-0.5 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out"
								/>

							</span>

						)}

						<span className={`ml-0 ${canDelete && 'group-hover:ml-2'} transition-all duration-300`}>Clear</span>

					</span>

				</button>

			</div>

		</div>

	);

}
