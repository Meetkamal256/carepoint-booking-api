"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, CalendarDays, RefreshCw } from "lucide-react";

import AppointmentSearch from "@/components/appointments/AppointmentSearch";
import AppointmentList from "@/components/appointments/AppointmentList";
import CancellationDialog from "@/components/appointments/CancellationDialog";

import { cancelBooking, getBookings, getSlots } from "@/lib/api";

import type { AppointmentSlot, Booking } from "@/types/booking";

interface AppointmentsFlowProps {
  initialEmail?: string;
}

export default function AppointmentsFlow({
  initialEmail,
}: AppointmentsFlowProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);

  const [activeEmail, setActiveEmail] = useState("");

  const [nextCursor, setNextCursor] = useState<string | null>(null);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(
    null,
  );

  const [searchError, setSearchError] = useState<string | null>(null);
  const [slotError, setSlotError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [cancellationError, setCancellationError] = useState<string | null>(
    null,
  );

  // Retrieve bookings and their corresponding appointment slots.
  const handleSearch = useCallback(async (email: string) => {
    setActiveEmail(email);
    setBookings([]);
    setSlots([]);
    setNextCursor(null);

    setSearchError(null);
    setSlotError(null);
    setLoadMoreError(null);

    setIsLoading(true);

    try {
      // The booking records are essential; slot details are supplementary.
      const [bookingsResult, slotsResult] = await Promise.allSettled([
        getBookings(email, 10),
        getSlots(),
      ]);

      if (bookingsResult.status === "rejected") {
        throw bookingsResult.reason;
      }

      setBookings(bookingsResult.value.bookings);
      setNextCursor(bookingsResult.value.next_cursor);

      if (slotsResult.status === "fulfilled") {
        setSlots(slotsResult.value.slots);
      } else {
        setSlotError(
          "Appointment dates and provider details could not be loaded.",
        );
      }
    } catch (error) {
      setSearchError(
        error instanceof Error
          ? error.message
          : "Unable to retrieve appointments. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Automatically retrieve bookings when an email is supplied in the URL.
  useEffect(() => {
    if (initialEmail?.trim()) {
      void handleSearch(initialEmail.trim().toLowerCase());
    }
  }, [initialEmail, handleSearch]);

  // Retrieve the next page of booking history.
  async function handleLoadMore() {
    if (!activeEmail || !nextCursor || isLoadingMore) return;

    setIsLoadingMore(true);
    setLoadMoreError(null);

    try {
      const response = await getBookings(activeEmail, 10, nextCursor);

      setBookings((currentBookings) => [
        ...currentBookings,
        ...response.bookings,
      ]);

      setNextCursor(response.next_cursor);
    } catch (error) {
      setLoadMoreError(
        error instanceof Error
          ? error.message
          : "Unable to load more appointments.",
      );
    } finally {
      setIsLoadingMore(false);
    }
  }

  // Open the cancellation confirmation dialog.
  function handleRequestCancellation(booking: Booking) {
    setSelectedBooking(booking);
    setCancellationError(null);
  }

  // Close the cancellation dialog.
  function handleCloseCancellation() {
    if (cancellingBookingId) return;

    setSelectedBooking(null);
    setCancellationError(null);
  }

  // Cancel an appointment through the existing backend API.
  async function handleConfirmCancellation(booking: Booking) {
    if (cancellingBookingId) return;

    setCancellingBookingId(booking.id);
    setCancellationError(null);

    try {
      const updatedBooking = await cancelBooking(booking.id);

      // Update the booking displayed on the page.
      setBookings((currentBookings) =>
        currentBookings.map((currentBooking) =>
          currentBooking.id === updatedBooking.id
            ? updatedBooking
            : currentBooking,
        ),
      );

      // The cancelled slot becomes available again.
      setSlots((currentSlots) =>
        currentSlots.map((slot) =>
          slot.id === updatedBooking.slot_id
            ? { ...slot, available: true }
            : slot,
        ),
      );

      setSelectedBooking(null);
    } catch (error) {
      setCancellationError(
        error instanceof Error
          ? error.message
          : "Unable to cancel this appointment. Please try again.",
      );
    } finally {
      setCancellingBookingId(null);
    }
  }

  return (
    <main className="bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Page heading */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-secondary">
            <CalendarDays size={16} />
            CAREPOINT PATIENT PORTAL
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            My appointments
          </h1>

          <p className="mt-3 max-w-2xl text-base leading-7 text-muted">
            View your appointment history, check booking details, and manage
            your upcoming clinic visits.
          </p>
        </div>

        {/* Patient email search */}
        <AppointmentSearch
          initialEmail={initialEmail}
          isLoading={isLoading}
          error={searchError}
          onSearch={handleSearch}
        />

        {/* Appointment results */}
        {activeEmail && !isLoading && !searchError && (
          <div className="mt-12">
            {slotError && (
              <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <AlertCircle size={19} className="mt-0.5 shrink-0" />
                {slotError}
              </div>
            )}

            <AppointmentList
              bookings={bookings}
              slots={slots}
              nextCursor={nextCursor}
              isLoadingMore={isLoadingMore}
              cancellingBookingId={cancellingBookingId}
              onLoadMore={handleLoadMore}
              onCancel={handleRequestCancellation}
            />

            {loadMoreError && (
              <div
                role="alert"
                className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
              >
                {loadMoreError}
              </div>
            )}
          </div>
        )}

        {/* Search loading feedback */}
        {isLoading && (
          <div className="mt-10 rounded-2xl border border-border bg-white px-6 py-14 text-center">
            <RefreshCw
              size={28}
              className="mx-auto animate-spin text-secondary"
            />

            <p className="mt-4 text-sm font-medium text-primary">
              Retrieving your appointments...
            </p>
          </div>
        )}

        {/* Cancellation confirmation */}
        <CancellationDialog
          booking={selectedBooking}
          isCancelling={
            cancellingBookingId === selectedBooking?.id &&
            selectedBooking !== null
          }
          error={cancellationError}
          onConfirm={handleConfirmCancellation}
          onClose={handleCloseCancellation}
        />
      </div>
    </main>
  );
}
