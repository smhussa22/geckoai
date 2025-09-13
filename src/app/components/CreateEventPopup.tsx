'use client';
import React, { useMemo, useState } from 'react';
import { LuClock, LuMapPin, LuFileText } from 'react-icons/lu';
import { BsXCircle } from 'react-icons/bs';
import { IoCreate } from 'react-icons/io5';
import { useUser } from '../contexts/UserContext';
import { useCalendar } from '../contexts/SelectedCalendarContext';

const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const toLocalDateInput = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

const parseTimeToMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

const label12h = (hhmm: string) => {
  let [h, m] = hhmm.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;

  return `${h}:${pad(m)} ${ampm}`;
};

const generateTimeOptions = () => {
  const opts: { value: string; label: string }[] = [];

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 15) {
      const value = `${pad(h)}:${pad(m)}`;
      opts.push({ value, label: label12h(value) });
    }
  }

  return opts;
};

const roundToNextQuarter = (d: Date) => {
  const q = 15 * 60 * 1000;
  return new Date(Math.ceil(d.getTime() / q) * q);
};

const composeLocalDate = (dateStr: string, timeStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);

  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

export default function CreateEventPopup({ onClose }: { onClose?: () => void }) {
  const { user } = useUser();
  const { calendar } = useCalendar();

  const now = useMemo(() => new Date(), []);
  const startDefault = useMemo(() => roundToNextQuarter(now), [now]);
  const endDefault = useMemo(
    () => new Date(startDefault.getTime() + 60 * 60 * 1000),
    [startDefault],
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const [date, setDate] = useState(toLocalDateInput(startDefault));
  const [startTime, setStartTime] = useState(
    `${pad(startDefault.getHours())}:${pad(startDefault.getMinutes())}`,
  );
  const [endTime, setEndTime] = useState(
    `${pad(endDefault.getHours())}:${pad(endDefault.getMinutes())}`,
  );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const timeOptions = useMemo(generateTimeOptions, []);

  const onChangeStartTime = (v: string) => {
    setStartTime(v);
    setErrorMsg(null);

    if (parseTimeToMinutes(endTime) < parseTimeToMinutes(v)) setEndTime(v);
  };

  const endTimeOptions = useMemo(() => {
    const min = parseTimeToMinutes(startTime);
    return timeOptions.filter((t) => parseTimeToMinutes(t.value) >= min);
  }, [timeOptions, startTime]);

  const handleCreate = async () => {
    setErrorMsg(null);

    if (!calendar) {
      setErrorMsg('No calendar selected.');
      return;
    }

    if (!date || !startTime || !endTime) {
      setErrorMsg('Pick a date, start time, and end time.');
      return;
    }

    const startDT = composeLocalDate(date, startTime);
    const endDT = composeLocalDate(date, endTime);

    if (endDT.getTime() <= startDT.getTime()) {
      setErrorMsg('End time must be after start time.');
      return;
    }

    setSubmitting(true);

    try {
      const encodedId = encodeURIComponent(calendar.id);
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

      const response = await fetch(`/api/calendars/${encodedId}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim() || 'Untitled',
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          start: startDT.toISOString(),
          end: endDT.toISOString(),
          timeZone,
        }),
      });

      if (!response.ok) {
        let msg = `Error: ${response.status}`;

        try {
          const data = await response.json();
          msg = data?.error || msg;
        } catch {}

        throw new Error(msg);
      }

      setTitle('');
      setDescription('');
      setLocation('');
      onClose?.();
    } catch (error: any) {
      setErrorMsg(error?.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-fit" data-user-email={user?.email || ''}>
      <div className="relative flex">
        <div>
          <h1 className="text-asparagus text-2xl font-bold tracking-tighter">Create Event</h1>
          <h2 className="text-broccoli mb-2 font-semibold tracking-tighter">
            Only date and time are required.
          </h2>
        </div>

        <button
          onClick={onClose}
          className="absolute right-0 mb-5 text-neutral-700 transition-colors duration-200 hover:text-neutral-600"
        >
          <BsXCircle size={25} />
        </button>
      </div>

      <div className="flex items-center justify-between">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Add title (optional)"
          autoCapitalize="off"
          spellCheck={false}
          autoCorrect="off"
          maxLength={40}
          className="text-asparagus mr-2 w-full border-b-2 border-neutral-700 bg-transparent pb-2 text-xl font-semibold transition-colors outline-none focus:border-neutral-600"
        />
      </div>

      <div className="mt-2 flex gap-3">
        <div className="pt-1 text-neutral-400">
          <LuFileText size={18} />
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add description (optional)"
          autoCapitalize="off"
          spellCheck={false}
          autoCorrect="off"
          maxLength={50}
          className="text-ghost w-full resize-none rounded-md border-b-2 border-transparent bg-neutral-800 px-3 py-2 text-sm placeholder-neutral-500 transition-colors outline-none focus:border-neutral-700"
        />
      </div>

      <div className="mt-3 space-y-3">
        <div className="flex items-start gap-3">
          <div className="pt-1 text-neutral-400">
            <LuClock size={18} />
          </div>

          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setErrorMsg(null);
                }}
                className="text-ghost rounded-md border border-transparent bg-neutral-800 px-3 py-2 text-sm outline-none hover:bg-neutral-700/70 focus:border-neutral-700"
              />

              <select
                value={startTime}
                onChange={(e) => onChangeStartTime(e.target.value)}
                className="text-ghost rounded-md border border-transparent bg-neutral-800 px-3 py-2 text-sm outline-none hover:bg-neutral-700/70 focus:border-neutral-700"
              >
                {timeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>

              <span className="text-ghost text-sm">to</span>

              <select
                value={endTime}
                onChange={(e) => {
                  setEndTime(e.target.value);
                  setErrorMsg(null);
                }}
                className="text-ghost rounded-md border border-transparent bg-neutral-800 px-3 py-2 text-sm outline-none hover:bg-neutral-700/70 focus:border-neutral-700"
              >
                {endTimeOptions.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Add location (optional)"
              className="w-full rounded-md bg-neutral-800 px-3 py-2 text-sm text-neutral-200 outline-none placeholder:text-neutral-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end">
        <button
          onClick={handleCreate}
          disabled={submitting || !calendar || !date || !startTime || !endTime}
          className="group hover:text-broccoli hover:bg-night bg-broccoli text-night flex w-full items-center justify-center rounded-lg px-4 py-2 text-2xl font-bold tracking-tighter transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="relative flex items-center">
            <span className="inline-flex w-0 overflow-hidden transition-all duration-300 ease-out group-hover:w-9">
              <IoCreate
                size={36}
                className="mb-0.5 -translate-x-2 opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100"
              />
            </span>

            <span className="ml-0 transition-all duration-300 group-hover:ml-2">
              {submitting ? 'Creating...' : 'Create'}
            </span>
          </span>
        </button>
      </div>
    </div>
  );
}
