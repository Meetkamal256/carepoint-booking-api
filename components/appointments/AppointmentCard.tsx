import { CalendarDays, Clock3, Hash, Stethoscope, XCircle } from "lucide-react";

import type { AppointmentSlot, Booking } from "@/types/booking";

interface AppointmentCardProps {
  booking: Booking;
  slot?: AppointmentSlot;
  isCancelling: boolean;
  onCancel: (booking: Booking) => void;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function formatTime(date: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export default function AppointmentCard({
  booking,
  slot,
  isCancelling,
  onCancel,
}: AppointmentCardProps) {
  const isConfirmed = booking.status === "confirmed";

  return (
    <article className="rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Appointment
          </p>

          <h3 className="mt-1 text-lg font-bold text-primary">
            {slot?.provider ?? "Provider information unavailable"}
          </h3>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold capitalize ${
            isConfirmed
              ? "bg-teal-50 text-secondary"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {booking.status}
        </span>
      </div>

      {/* Appointment information */}
      <div className="mt-6 space-y-4">
        {slot ? (
          <>
            <div className="flex items-start gap-3">
              <CalendarDays size={19} className="mt-0.5 text-secondary" />

              <div>
                <p className="text-xs text-muted">Appointment date</p>
                <time
                  dateTime={slot.start}
                  className="mt-1 block text-sm font-medium text-primary"
                >
                  {formatDate(slot.start)}
                </time>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock3 size={19} className="mt-0.5 text-secondary" />

              <div>
                <p className="text-xs text-muted">Appointment time</p>
                <p className="mt-1 text-sm font-medium text-primary">
                  {formatTime(slot.start)} – {formatTime(slot.end)}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-muted">
            Appointment schedule information is currently unavailable.
          </p>
        )}

        <div className="flex items-start gap-3">
          <Hash size={19} className="mt-0.5 text-secondary" />

          <div className="min-w-0">
            <p className="text-xs text-muted">Booking reference</p>
            <p className="mt-1 break-all text-sm font-medium text-primary">
              {booking.id}
            </p>
          </div>
        </div>
      </div>

      {/* Cancellation action */}
      {isConfirmed && (
        <div className="mt-6 border-t border-border pt-5">
          <button
            type="button"
            onClick={() => onCancel(booking)}
            disabled={isCancelling}
            className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <XCircle size={17} />
            {isCancelling ? "Cancelling appointment..." : "Cancel appointment"}
          </button>
        </div>
      )}
    </article>
  );
}
