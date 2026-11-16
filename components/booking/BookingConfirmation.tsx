import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  Clock3,
  Hash,
  Mail,
  Stethoscope,
  UserRound,
} from "lucide-react";

import type { AppointmentSlot, Booking } from "@/types/booking";

interface BookingConfirmationProps {
  booking: Booking;
  slot: AppointmentSlot;
  onBookAnother: () => void;
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

export default function BookingConfirmation({
  booking,
  slot,
  onBookAnother,
}: BookingConfirmationProps) {
  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-border bg-white p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-secondary">
          <CalendarCheck size={34} />
        </div>

        <p className="mt-6 text-sm font-semibold uppercase tracking-wider text-secondary">
          Booking confirmed
        </p>

        <h1 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">
          Your appointment is booked!
        </h1>

        <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-muted">
          Your appointment has been successfully reserved. Keep your booking
          reference for future reference.
        </p>

        {/* Booking reference */}
        <div className="mt-8 rounded-xl border border-border bg-background p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Booking reference
          </p>

          <div className="mt-2 flex items-center gap-2 text-primary">
            <Hash size={19} className="text-secondary" />
            <span className="break-all font-semibold">{booking.id}</span>
          </div>
        </div>

        {/* Appointment details */}
        <div className="mt-6 space-y-5 text-left">
          <h2 className="text-lg font-bold text-primary">
            Appointment details
          </h2>

          <div className="flex items-start gap-3">
            <UserRound size={20} className="mt-0.5 text-secondary" />
            <div>
              <p className="text-xs text-muted">Patient</p>
              <p className="mt-1 text-sm font-semibold text-primary">
                {booking.name}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail size={20} className="mt-0.5 text-secondary" />
            <div>
              <p className="text-xs text-muted">Email address</p>
              <p className="mt-1 break-all text-sm font-semibold text-primary">
                {booking.email}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Stethoscope size={20} className="mt-0.5 text-secondary" />
            <div>
              <p className="text-xs text-muted">Healthcare provider</p>
              <p className="mt-1 text-sm font-semibold text-primary">
                {slot.provider}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarDays size={20} className="mt-0.5 text-secondary" />
            <div>
              <p className="text-xs text-muted">Appointment date</p>
              <p className="mt-1 text-sm font-semibold text-primary">
                {formatDate(slot.start)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock3 size={20} className="mt-0.5 text-secondary" />
            <div>
              <p className="text-xs text-muted">Appointment time</p>
              <p className="mt-1 text-sm font-semibold text-primary">
                {formatTime(slot.start)} – {formatTime(slot.end)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CalendarCheck size={20} className="mt-0.5 text-secondary" />
            <div>
              <p className="text-xs text-muted">Booking status</p>
              <p className="mt-1 text-sm font-semibold capitalize text-secondary">
                {booking.status}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation actions */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/appointments?email=${encodeURIComponent(booking.email)}`}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            My appointments
            <ArrowRight size={17} />
          </Link>

          <button
            type="button"
            onClick={onBookAnother}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-border px-5 py-3 text-sm font-semibold text-primary transition hover:bg-slate-50"
          >
            Book another appointment
          </button>
        </div>
      </div>
    </section>
  );
}
