export type BookingStatus = "confirmed" | "cancelled";

export interface AppointmentSlot {
  id: string;
  provider: string;
  start: string;
  end: string;
  available: boolean;
}

export interface SlotsResponse {
  slots: AppointmentSlot[];
}

export interface CreateBookingRequest {
  slot_id: string;
  name: string;
  email: string;
}

export interface Booking {
  id: string;
  slot_id: string;
  name: string;
  email: string;
  status: BookingStatus;
  created_at: string;
}

export interface BookingsResponse {
  bookings: Booking[];
  next_cursor: string | null;
}
