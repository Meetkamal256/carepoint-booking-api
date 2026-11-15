import BookingHeader from "@/components/booking/BookingHeader";
import BookingFlow from "@/components/booking/BookingFlow";

export default function BookPage() {
  return (
    <>
      <BookingHeader />

      <main className="bg-background px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <BookingFlow />
        </div>
      </main>
    </>
  );
}
