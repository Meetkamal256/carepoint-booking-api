"use client";

import { AlertTriangle, LoaderCircle, X } from "lucide-react";

import type { Booking } from "@/types/booking";

interface CancellationDialogProps {
  booking: Booking | null;
  isCancelling: boolean;
  error: string | null;
  onConfirm: (booking: Booking) => void;
  onClose: () => void;
}

export default function CancellationDialog({
  booking,
  isCancelling,
  error,
  onConfirm,
  onClose,
}: CancellationDialogProps) {
  // Don't render the dialog when no booking has been selected.
  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancellation-title"
        aria-describedby="cancellation-description"
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isCancelling}
          aria-label="Close cancellation dialog"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-slate-100 disabled:opacity-50"
        >
          <X size={19} />
        </button>

        {/* Warning icon */}
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
          <AlertTriangle size={27} />
        </div>

        <h2
          id="cancellation-title"
          className="mt-5 text-xl font-bold text-primary"
        >
          Cancel this appointment?
        </h2>

        <p
          id="cancellation-description"
          className="mt-3 text-sm leading-7 text-muted"
        >
          Are you sure you want to cancel this appointment for{" "}
          <span className="font-semibold text-primary">{booking.name}</span>?
          The appointment time will become available for other patients.
        </p>

        {/* Booking reference */}
        <div className="mt-5 rounded-xl bg-background p-4">
          <p className="text-xs font-medium text-muted">Booking reference</p>

          <p className="mt-1 break-all text-sm font-semibold text-primary">
            {booking.id}
          </p>
        </div>

        {/* Cancellation error */}
        {error && (
          <div
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            disabled={isCancelling}
            className="min-h-11 flex-1 rounded-xl border border-border px-4 py-3 text-sm font-semibold text-primary transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Keep appointment
          </button>

          <button
            type="button"
            onClick={() => onConfirm(booking)}
            disabled={isCancelling}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isCancelling ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Cancelling...
              </>
            ) : (
              "Confirm cancellation"
            )}
          </button>
        </div>
      </section>
    </div>
  );
}
