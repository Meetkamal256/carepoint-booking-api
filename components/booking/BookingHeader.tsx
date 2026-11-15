import { CalendarDays } from "lucide-react";

export default function BookingHeader() {
  return (
    <section className="bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-secondary">
            <CalendarDays size={25} />
          </div>

          <span className="text-sm font-semibold text-secondary">
            CAREPOINT APPOINTMENTS
          </span>
        </div>

        <div className="mt-6 max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Book your appointment
          </h1>

          <p className="mt-3 text-base leading-7 text-muted">
            Find an available appointment time, choose your preferred healthcare
            provider, and complete your booking online.
          </p>
        </div>
      </div>
    </section>
  );
}
