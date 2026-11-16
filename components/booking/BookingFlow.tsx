"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CalendarDays, RefreshCw } from "lucide-react";

import BookingConfirmation from "@/components/booking/BookingConfirmation";
import BookingForm from "@/components/booking/BookingForm";
import ProviderFilter from "@/components/booking/ProviderFilter";
import SlotCard from "@/components/booking/SlotCard";

import { createBooking, getSlots } from "@/lib/api";

import type {
  AppointmentSlot,
  Booking,
  CreateBookingRequest,
} from "@/types/booking";

export default function BookingFlow() {
  const [slots, setSlots] = useState<AppointmentSlot[]>([]);
  const [selectedProvider, setSelectedProvider] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(
    null,
  );

  const [booking, setBooking] = useState<Booking | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [loadError, setLoadError] = useState<string | null>(null);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Keep the same key when retrying an uncertain booking request.
  const idempotencyKeyRef = useRef<string | null>(null);

  const loadSlots = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const response = await getSlots();

      // Past appointments cannot be booked, so only show future slots.
      const upcomingSlots = response.slots.filter(
        (slot) => Date.parse(slot.start) > Date.now(),
      );

      setSlots(upcomingSlots);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to load appointments. Please try again.";

      setLoadError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load appointment slots when the booking page first opens.
  useEffect(() => {
    void loadSlots();
  }, [loadSlots]);

  // Build the provider list from the retrieved appointment slots.
  const providers = useMemo(
    () =>
      Array.from(new Set(slots.map((slot) => slot.provider))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [slots],
  );

  // Apply the selected provider filter.
  const filteredSlots = useMemo(
    () =>
      selectedProvider
        ? slots.filter((slot) => slot.provider === selectedProvider)
        : slots,
    [slots, selectedProvider],
  );

  const availableCount = filteredSlots.filter((slot) => slot.available).length;

  function handleSelectSlot(slot: AppointmentSlot) {
    if (!slot.available) return;

    setSelectedSlot(slot);
    setBookingError(null);

    // A different appointment needs a different idempotency key.
    idempotencyKeyRef.current = null;
  }

  function handleBackToSlots() {
    if (isSubmitting) return;

    setSelectedSlot(null);
    setBookingError(null);
    idempotencyKeyRef.current = null;
  }

  // Reset the booking interface so the patient can make another appointment.
  function handleBookAnotherAppointment() {
    if (isSubmitting) return;

    setBooking(null);
    setSelectedSlot(null);
    setSelectedProvider("");
    setBookingError(null);

    // A new booking must use a fresh idempotency key.
    idempotencyKeyRef.current = null;

    // Refresh availability so the previously booked slot is no longer shown
    // as available.
    void loadSlots();
  }

  async function handleSubmitBooking(bookingDetails: CreateBookingRequest) {
    if (!selectedSlot || isSubmitting) return;

    setIsSubmitting(true);
    setBookingError(null);

    try {
      // Generate a key once and reuse it if the request needs retrying.
      if (!idempotencyKeyRef.current) {
        idempotencyKeyRef.current = crypto.randomUUID();
      }

      const result = await createBooking(
        bookingDetails,
        idempotencyKeyRef.current,
      );

      setBooking(result);
    } catch (error) {
      const apiError = error as Error & {
        status?: number;
        retryAfter?: string;
      };

      if (apiError.status === 409) {
        setBookingError(
          "This appointment has just been booked by someone else. Please choose another time.",
        );

        setSlots((currentSlots) =>
          currentSlots.map((slot) =>
            slot.id === selectedSlot.id ? { ...slot, available: false } : slot,
          ),
        );
      } else if (apiError.status === 429) {
        const waitTime = apiError.retryAfter
          ? ` Please try again in ${apiError.retryAfter} seconds.`
          : " Please try again shortly.";

        setBookingError(`Too many booking attempts.${waitTime}`);
      } else {
        setBookingError(
          apiError.message ||
            "We couldn't complete your booking. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  // Show the confirmation after a successful booking.
  if (booking && selectedSlot) {
    return (
      <BookingConfirmation
        booking={booking}
        slot={selectedSlot}
        onBookAnother={handleBookAnotherAppointment}
      />
    );
  }

  // Show the patient form after an appointment has been selected.
  if (selectedSlot) {
    return (
      <BookingForm
        slot={selectedSlot}
        isSubmitting={isSubmitting}
        error={bookingError}
        onSubmitBooking={handleSubmitBooking}
        onBack={handleBackToSlots}
      />
    );
  }

  return (
    <section>
      {loadError && slots.length === 0 && !isLoading ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 shrink-0 text-red-600" />

            <div className="flex-1">
              <h2 className="font-semibold text-red-800">
                Unable to load appointments
              </h2>

              <p className="mt-2 text-sm leading-6 text-red-700">{loadError}</p>

              <button
                type="button"
                onClick={() => void loadSlots()}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
              >
                <RefreshCw size={16} />
                Try again
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <ProviderFilter
              providers={providers}
              selectedProvider={selectedProvider}
              onProviderChange={setSelectedProvider}
            />

            {!isLoading && (
              <p className="mt-4 text-sm text-muted">
                {availableCount} available{" "}
                {availableCount === 1 ? "appointment" : "appointments"}
              </p>
            )}
          </div>

          {isLoading ? (
            <div
              className="rounded-2xl border border-border bg-white px-6 py-16 text-center"
              aria-live="polite"
            >
              <RefreshCw
                size={28}
                className="mx-auto animate-spin text-secondary"
              />

              <p className="mt-4 text-sm font-medium text-primary">
                Loading available appointments...
              </p>
            </div>
          ) : filteredSlots.length > 0 ? (
            <>
              {loadError && (
                <p role="alert" className="mb-4 text-sm text-red-600">
                  {loadError}
                </p>
              )}

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredSlots.map((slot) => (
                  <SlotCard
                    key={slot.id}
                    slot={slot}
                    isSelected={false}
                    onSelect={handleSelectSlot}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-border bg-white px-6 py-16 text-center">
              <CalendarDays size={34} className="mx-auto text-secondary" />

              <h3 className="mt-4 text-lg font-bold text-primary">
                No appointments available
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">
                {selectedProvider
                  ? `There are currently no upcoming appointments for ${selectedProvider}. Try selecting another provider.`
                  : "There are currently no upcoming appointments available. Please check again later."}
              </p>

              {selectedProvider && (
                <button
                  type="button"
                  onClick={() => setSelectedProvider("")}
                  className="mt-5 text-sm font-semibold text-secondary hover:text-teal-700"
                >
                  View all providers
                </button>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
