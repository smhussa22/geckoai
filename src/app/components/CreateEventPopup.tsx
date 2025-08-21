"use client";
import React, { useState } from "react";
import { LuClock, LuMapPin, LuFileText } from "react-icons/lu";
import { BsXCircle } from "react-icons/bs";
import { useUser } from "../contexts/UserContext";
import { IoCreate } from "react-icons/io5";

export default function CreateEventPopup({ onClose }: { onClose?: () => void }) {
	const { user } = useUser();

	const [titleValue, setTitleValue] = useState("");
	const [descriptionValue, setDescriptionValue] = useState("");

	return (

		<div className="w-full" data-user-email={user?.email || ""}>

			<div className="flex relative">

				<div>

					<h1 className="text-2xl font-bold tracking-tighter text-asparagus">Create Event</h1>
					<h2 className="mb-2 font-semibold tracking-tighter text-broccoli">Quickly create an event for this calendar.</h2>

				</div>

				<button onClick={onClose} className="absolute right-0 text-neutral-700 mb-5 transition-colors duration-200 hover:text-neutral-600">
					
					<BsXCircle size={25} />

				</button>

			</div>

			<div className="flex items-center justify-between">
				
				<input
					type="text"
					value={titleValue}
					onChange={(e) => setTitleValue(e.target.value)}
					placeholder="Add title"
					autoCapitalize="off"
					spellCheck={false}
					autoCorrect="off"
					maxLength={120}
					className={`w-full mr-2 bg-transparent text-xl text-asparagus font-semibold outline-none border-b-2 pb-2 transition-colors ${
						titleValue ? "border-asparagus" : "border-neutral-700 focus:border-neutral-600"
					}`}
				/>

			</div>

			<div className="mt-2 flex gap-3">

				<div className="pt-1 text-neutral-400">

					<LuFileText size={18} />

				</div>

				<textarea
					value={descriptionValue}
					onChange={(e) => setDescriptionValue(e.target.value)}
					placeholder="Add description"
					autoCapitalize="off"
					spellCheck={false}
					autoCorrect="off"
					maxLength={1000}
					className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm placeholder-neutral-500 text-ghost outline-none border-b-2 transition-colors h-24 resize-y border-transparent focus:border-neutral-700"
				/>

			</div>

			<div className="mt-3">

				<div className="space-y-3">

					<div className="flex items-start gap-3">

						<div className="pt-1 text-neutral-400">

							<LuClock size={18} />

						</div>

						<div className="flex-1 space-y-2">

							<div className="flex flex-wrap items-center gap-2">

								<button className="rounded-md text-ghost bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700/70">Wednesday, August 20</button>
								<span className="text-ghost text-sm">from</span>
								<button className="rounded-md text-ghost bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700/70">12:30pm</button>
								<span className="text-ghost text-sm">to</span>
								<button className="rounded-md text-ghost bg-neutral-800 px-3 py-2 text-sm hover:bg-neutral-700/70">1:30pm</button>
							
							</div>

						</div>

					</div>

					<div className="flex items-start gap-3">

						<div className="pt-1 text-neutral-400">

							<LuMapPin size={18} />

						</div>

						<div className="flex-1">
							
							<input
								type="text"
								placeholder="Add location"
								className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm text-neutral-200 placeholder:text-neutral-500 outline-none"
							/>

						</div>

					</div>

				</div>

			</div>

			<div className="mt-4 flex items-center justify-end">

				<button className="group hover:text-broccoli hover:bg-night duration-200 flex items-center justify-center text-2xl tracking-tighter w-full rounded-lg bg-broccoli text-night transition-colors font-bold py-2 px-4" disabled>
					
					<span className="relative flex items-center">
						
						<span className="overflow-hidden inline-flex w-0 group-hover:w-9 transition-all duration-300 ease-out">
							
							<IoCreate size={36} className="mb-0.5 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out" />
						
						</span>
						
						<span className="ml-0 group-hover:ml-2 transition-all duration-300">Create</span>
					</span>

				</button>

			</div>

		</div>

	);

}
