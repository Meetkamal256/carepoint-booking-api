import type {
  Booking,
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
