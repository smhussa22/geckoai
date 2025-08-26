"use client";
import React, { useState } from "react";
import { BsXCircle } from "react-icons/bs";
import { IoIosSettings } from "react-icons/io";
import { TbCalendarHeart, TbCalendarDot, TbCalendarCode, TbCalendarClock, TbCalendarDollar, TbCalendarStar, TbCalendarPin, TbCalendarUser } from "react-icons/tb";

const CalendarSettingsPopup = ({ onClose }: { onClose?: () => void }) => {

    const [calendarName, setCalendarName] = useState("");
	const [calendarDescription, setCalendarDescription] = useState("");
	const [visibility, setVisibility] = useState<"default" | "public" | "private">("default");
	const defaultBackgroundColor = "#698f3f";
	const defaultTextColor = "#000000";
	const defaultIcon = "user";

	const iconChoices = [

		{ key: "heart", Icon: TbCalendarHeart },
		{ key: "dot", Icon: TbCalendarDot },
		{ key: "code", Icon: TbCalendarCode },
		{ key: "clock", Icon: TbCalendarClock },
		{ key: "dollar", Icon: TbCalendarDollar },
		{ key: "star", Icon: TbCalendarStar },
		{ key: "pin", Icon: TbCalendarPin },
		{ key: "user", Icon: TbCalendarUser },

	];

	const [selectedIconKey, setSelectedIconKey] = useState(iconChoices[0].key);
	const [colorHex, setColorHex] = useState("#ffffff");

	return (

		<div className="w-full">

			<div className="flex relative">

				<div>

					<h1 className="text-2xl font-bold tracking-tighter text-asparagus">Calendar Settings</h1>
					<h2 className="mb-2 font-semibold tracking-tighter text-broccoli">Manage settings and preferences for this calendar.</h2>

				</div>

				<button onClick={onClose} className="absolute right-0 text-neutral-700 transition-colors duration-200 hover:text-neutral-600">

					<BsXCircle size={25} />

				</button>

			</div>

			<div className="flex items-center gap-3 my-2">

				<hr className="border-neutral-800 flex-1" />

				<span className="text-xs tracking-tighter text-neutral-400">Google Calendar</span>
                
				<hr className="border-neutral-800 flex-1" />

			</div>

			<div className="space-y-2">

				<div className="flex flex-col gap-1">

					<label className="text-xs text-ghost ml-0.5">Calendar Name</label>

					<input

						type="text"
						value={calendarName}
						onChange={(e) => setCalendarName(e.target.value)}
						placeholder="Add calendar name"
						autoCapitalize="off"
						spellCheck={false}
						autoCorrect="off"
						maxLength={120}
						className={`w-full bg-transparent text-lg text-asparagus font-semibold outline-none border-b-2 pb-2 transition-colors ${
							calendarName ? "border-asparagus" : "border-neutral-700 focus:border-neutral-600"
						}`}

					/>

				</div>

				<div className="flex flex-col gap-2">

					<label className="text-xs text-ghost gap-1 ml-0.5">Calendar Description</label>

					<textarea

						value={calendarDescription}
						onChange={(e) => setCalendarDescription(e.target.value)}
						placeholder="Add description"
						autoCapitalize="off"
						spellCheck={false}
						autoCorrect="off"
						maxLength={1000}
						className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm placeholder-neutral-500 text-ghost outline-none border-b-2 transition-colors h-16 resize-none border-transparent focus:border-neutral-700"
					
                    />

				</div>

				<div className="flex flex-col gap-2">

					<label className="text-xs ml-0.5 text-ghost">Default Event Visibility</label>

					<div className="inline-flex rounded-lg bg-neutral-800 p-1 w-fit">

						<button

							onClick={() => setVisibility("default")}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								visibility === "default" ? "bg-neutral-700 text-white" : "text-neutral-300 hover:text-white hover:bg-neutral-700/50"
							}`}

						>

							Calendar Default

						</button>

						<button

							onClick={() => setVisibility("public")}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								visibility === "public" ? "bg-neutral-700 text-white" : "text-neutral-300 hover:text-white hover:bg-neutral-700/50"
							}`}

						>

							Public

						</button>

						<button

							onClick={() => setVisibility("private")}
							className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
								visibility === "private" ? "bg-neutral-700 text-white" : "text-neutral-300 hover:text-white hover:bg-neutral-700/50"
							}`}

						>

							Private

						</button>

					</div>

				</div>

			</div>

			<div className="flex items-center gap-3 my-2">

				<hr className="border-neutral-800 flex-1" />

				<span className="text-xs tracking-tighter text-neutral-400">Appearance in List</span>

				<hr className="border-neutral-800 flex-1" />

			</div>

			<div className="space-y-2">

				<div className="flex flex-col gap-2">

					<div className="flex items-center justify-between">

						<h3 className="text-xs text-ghost">Calendar Icon</h3>
	
					</div>

					<div className="flex gap-2">

						{iconChoices.map(({ key, Icon }) => (

							<button

								key={key}
								onClick={() => setSelectedIconKey(key)}
								className={`w-fit h-fit p-2 rounded-lg flex items-center justify-center bg-neutral-800 hover:bg-neutral-700 transition-colors ${
									selectedIconKey === key ? "ring-2 ring-asparagus" : "ring-1 ring-neutral-800"
								}`}

							>

								<Icon size={30} className="text-ghost" />

							</button>

						))}

					</div>

				</div>

				<div className="flex flex-col gap-2">

					<div className="flex items-center justify-between">

						<h3 className="text-xs text-ghost">Calendar Color</h3>

					</div>

					<div className="flex items-center gap-2">

						<input

							type="color"
							value={colorHex}
							onChange={(e) => setColorHex(e.target.value)}
							className="h-10 w-10 rounded-md bg-neutral-800 p-1 ring-1 ring-neutral-800 cursor-pointer"

						/>

						<input

							type="text"
							value={colorHex}
							onChange={(e) => {
								const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`;
								setColorHex(v.slice(0, 7));
							}}
							placeholder="#ffffff"
							className="w-28 rounded-md bg-neutral-800 px-3 py-2 text-sm text-ghost outline-none ring-1 ring-neutral-800"

						/>

					</div>

				</div>

			</div>

			<div className="mt-2 flex items-center justify-end">

				<button className="group hover:text-gray-500 hover:bg-night duration-200 flex items-center justify-center text-2xl tracking-tighter w-full rounded-lg bg-gray-500 text-night transition-colors font-bold py-2 px-4" disabled>

					<span className="relative flex items-center">

						<span className="overflow-hidden inline-flex w-0 group-hover:w-9 transition-all duration-300 ease-out">

							<IoIosSettings size={36} className="mb-0.5 -translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out" />
						
                        </span>
						
                        <span className="ml-0 group-hover:ml-2 transition-all duration-300">Save</span>

					</span>

				</button>

			</div>

		</div>

	);

};

export default CalendarSettingsPopup;
