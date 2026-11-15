"use client";

import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  LoaderCircle,
  Mail,
  UserRound,
} from "lucide-react";

import type { AppointmentSlot, CreateBookingRequest } from "@/types/booking";

interface BookingFormProps {
  slot: AppointmentSlot;
  isSubmitting: boolean;
  error: string | null;
  onSubmitBooking: (booking: CreateBookingRequest) => void;
  onBack: () => void;
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

export default function BookingForm({
  slot,
  isSubmitting,
  error,
  onSubmitBooking,
  onBack,
}: BookingFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!trimmedName || !normalizedEmail) {
      return;
    }

    onSubmitBooking({
      slot_id: slot.id,
      name: trimmedName,
      email: normalizedEmail,
    });
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <button
        type="button"
        onClick={onBack}
        disabled={isSubmitting}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted transition hover:text-secondary disabled:opacity-50"
      >
        <ArrowLeft size={17} />
        Choose another appointment
      </button>

      <div className="rounded-2xl border border-border bg-white p-5 shadow-sm sm:p-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-secondary">
            Almost there
          </p>

          <h2 className="mt-2 text-2xl font-bold text-primary">
            Complete your booking
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Enter your details below to confirm your appointment.
          </p>
        </div>

        {/* Selected appointment summary */}
        <div className="mt-7 rounded-xl border border-teal-100 bg-teal-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-secondary">
            Selected appointment
          </p>

          <h3 className="mt-3 text-lg font-bold text-primary">
            {slot.provider}
          </h3>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted">
            <span className="inline-flex items-center gap-2">
              <CalendarDays size={16} className="text-secondary" />
              {formatDate(slot.start)}
            </span>

            <span className="inline-flex items-center gap-2">
              <Clock3 size={16} className="text-secondary" />
              {formatTime(slot.start)} – {formatTime(slot.end)}
            </span>
          </div>
        </div>

        {/* Patient information form */}
        <form onSubmit={handleSubmit} className="mt-7 space-y-5">
          <div>
            <label
              htmlFor="patient-name"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Full name
            </label>

            <div className="relative">
              <UserRound
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                id="patient-name"
                type="text"
                name="name"
                autoComplete="name"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                disabled={isSubmitting}
                className="min-h-12 w-full rounded-xl border border-border bg-white py-3 pl-11 pr-4 text-sm text-primary outline-none transition placeholder:text-slate-400 focus:border-secondary focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="patient-email"
              className="mb-2 block text-sm font-semibold text-primary"
            >
              Email address
            </label>

            <div className="relative">
              <Mail
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
              />

              <input
                id="patient-email"
                type="email"
                name="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                disabled={isSubmitting}
                className="min-h-12 w-full rounded-xl border border-border bg-white py-3 pl-11 pr-4 text-sm text-primary outline-none transition placeholder:text-slate-400 focus:border-secondary focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
              />
            </div>

            <p className="mt-2 text-xs leading-5 text-muted">
              We'll use this email address to help you retrieve your
              appointments later.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !name.trim() || !email.trim()}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Confirming appointment...
              </>
            ) : (
              "Confirm appointment"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
