import type {
  Booking,
  BookingsResponse,
  CreateBookingRequest,
  SlotsResponse,
} from "@/types/booking";

async function handleResponse<T>(response: Response): Promise<T> {
  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === "object" &&
      data !== null &&
      "error" in data &&
      typeof data.error === "string"
        ? data.error
        : "Something went wrong. Please try again.";

    const error = new Error(message) as Error & {
      status?: number;
      retryAfter?: string;
    };

    error.status = response.status;
    error.retryAfter = response.headers.get("Retry-After") ?? undefined;

    throw error;
  }

  return data as T;
}

// Retrieve appointment slots, optionally filtered by provider.
export async function getSlots(provider?: string): Promise<SlotsResponse> {
  const params = new URLSearchParams();

  if (provider) {
    params.set("provider", provider);
  }

  const query = params.toString();

  const response = await fetch(`/api/slots${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });

  return handleResponse<SlotsResponse>(response);
}

// Submit a new appointment booking.
export async function createBooking(
  booking: CreateBookingRequest,
  idempotencyKey: string,
): Promise<Booking> {
  const response = await fetch("/api/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(booking),
  });

  return handleResponse<Booking>(response);
}

// Retrieve a patient's booking history.
export async function getBookings(
  email: string,
  limit = 10,
  cursor?: string,
): Promise<BookingsResponse> {
  const params = new URLSearchParams({
    email,
    limit: String(limit),
  });

  if (cursor) {
    params.set("cursor", cursor);
  }

  const response = await fetch(`/api/bookings?${params.toString()}`, {
    cache: "no-store",
  });

  return handleResponse<BookingsResponse>(response);
}

// Cancel a patient's appointment.
export async function cancelBooking(bookingId: string): Promise<Booking> {
  const response = await fetch(
    `/api/bookings/${encodeURIComponent(bookingId)}`,
    {
      method: "DELETE",
    },
  );

  return handleResponse<Booking>(response);
}
