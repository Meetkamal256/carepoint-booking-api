"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, Mail, Search } from "lucide-react";

interface AppointmentSearchProps {
  initialEmail?: string;
  isLoading: boolean;
  error: string | null;
  onSearch: (email: string) => void;
}

export default function AppointmentSearch({
  initialEmail,
  isLoading,
  error,
  onSearch,
}: AppointmentSearchProps) {
  const [email, setEmail] = useState(initialEmail ?? "");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) return;

    onSearch(normalizedEmail);
  }

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-8">
        <div>
          <h2 className="text-xl font-bold text-primary">
            Find your appointments
          </h2>

          <p className="mt-2 text-sm leading-6 text-muted">
            Enter the email address you used when booking to retrieve your
            appointment history.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6">
          <label
            htmlFor="appointment-email"
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
              id="appointment-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              disabled={isLoading}
              className="min-h-12 w-full rounded-xl border border-border bg-white py-3 pl-11 pr-4 text-sm text-primary outline-none transition placeholder:text-slate-400 focus:border-secondary focus:ring-2 focus:ring-teal-100 disabled:bg-slate-50"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Searching appointments...
              </>
            ) : (
              <>
                <Search size={18} />
                Search appointments
              </>
            )}
          </button>
        </form>

        <p className="mt-4 text-xs leading-5 text-muted">
          No account required. Use the same email address you provided when
          booking your appointment.
        </p>
      </div>
    </section>
  );
}
