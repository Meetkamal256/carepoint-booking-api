import { CalendarDays, ClipboardList } from "lucide-react";

import AppointmentCard from "@/components/appointments/AppointmentCard";

import type { AppointmentSlot, Booking } from "@/types/booking";

interface AppointmentListProps {
  bookings: Booking[];
  slots: AppointmentSlot[];
  nextCursor: string | null;
  isLoadingMore: boolean;
  cancellingBookingId: string | null;
  onLoadMore: () => void;
  onCancel: (booking: Booking) => void;
}

export default function AppointmentList({
  bookings,
  slots,
  nextCursor,
  isLoadingMore,
  cancellingBookingId,
  onLoadMore,
  onCancel,
}: AppointmentListProps) {
  // Match each booking to its corresponding appointment slot.
  const slotsById = new Map(slots.map((slot) => [slot.id, slot]));

  if (bookings.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-white px-6 py-16 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-secondary">
          <CalendarDays size={27} />
        </div>

        <h3 className="mt-5 text-lg font-bold text-primary">
          No appointments found
        </h3>

        <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted">
          We couldn't find any appointments associated with this email address.
          Check the email address or book a new appointment.
        </p>
      </div>
    );
  }

  return (
    <section>
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-primary">Your appointments</h2>

          <p className="mt-1 text-sm text-muted">
            View and manage your booking history.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 text-sm font-medium text-muted">
          <ClipboardList size={18} />
          {bookings.length} {bookings.length === 1 ? "booking" : "bookings"}{" "}
          loaded
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        {bookings.map((booking) => (
          <AppointmentCard
            key={booking.id}
            booking={booking}
            slot={slotsById.get(booking.slot_id)}
            isCancelling={cancellingBookingId === booking.id}
            onCancel={onCancel}
          />
        ))}
      </div>

      {nextCursor && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMore
              ? "Loading appointments..."
              : "Load more appointments"}
          </button>
        </div>
      )}
    </section>
  );
}
