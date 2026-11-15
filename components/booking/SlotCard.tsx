import { CalendarDays, CheckCircle2, Clock3, XCircle } from "lucide-react";

import type { AppointmentSlot } from "@/types/booking";

interface SlotCardProps {
  slot: AppointmentSlot;
  isSelected: boolean;
  onSelect: (slot: AppointmentSlot) => void;
}

function formatAppointmentDate(date: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatAppointmentTime(date: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function SlotCard({
  slot,
  isSelected,
  onSelect,
}: SlotCardProps) {
  const isAvailable = slot.available;

  return (
    <article
      className={`rounded-2xl border bg-white p-5 transition ${
        isSelected
          ? "border-secondary ring-2 ring-teal-100"
          : "border-border hover:border-teal-300"
      } ${!isAvailable ? "opacity-70" : ""}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isAvailable ? (
            <CheckCircle2 size={18} className="text-secondary" />
          ) : (
            <XCircle size={18} className="text-slate-400" />
          )}

          <span
            className={`text-sm font-semibold ${
              isAvailable ? "text-secondary" : "text-muted"
            }`}
          >
            {isAvailable ? "Available" : "Booked"}
          </span>
        </div>

        <CalendarDays size={21} className="text-secondary" />
      </div>

      <h3 className="mt-5 text-lg font-bold text-primary">{slot.provider}</h3>

      <p className="mt-3 flex items-center gap-2 text-sm font-medium text-primary">
        <CalendarDays size={17} className="text-muted" />

        <time dateTime={slot.start}>{formatAppointmentDate(slot.start)}</time>
      </p>

      <p className="mt-2 flex items-center gap-2 text-sm text-muted">
        <Clock3 size={17} />

        <time dateTime={slot.start}>{formatAppointmentTime(slot.start)}</time>

        <span aria-hidden="true">–</span>

        <time dateTime={slot.end}>{formatAppointmentTime(slot.end)}</time>
      </p>

      <button
        type="button"
        disabled={!isAvailable}
        onClick={() => onSelect(slot)}
        aria-pressed={isSelected}
        className={`mt-6 w-full rounded-xl px-4 py-3 text-sm font-semibold transition ${
          !isAvailable
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : isSelected
              ? "bg-primary text-white"
              : "bg-teal-50 text-secondary hover:bg-teal-100"
        }`}
      >
        {!isAvailable
          ? "Already booked"
          : isSelected
            ? "Appointment selected"
            : "Select appointment"}
      </button>
    </article>
  );
}
