import { Suspense } from "react";

import AppointmentsFlow from "@/components/appointments/AppointmentsFlow";

interface AppointmentsPageProps {
  searchParams: Promise<{
    email?: string | string[];
  }>;
}

// Handles URL search parameters at request time.
async function AppointmentsContent({ searchParams }: AppointmentsPageProps) {
  const params = await searchParams;

  const initialEmail =
    typeof params.email === "string" ? params.email : undefined;

  return <AppointmentsFlow initialEmail={initialEmail} />;
}

// Placeholder displayed while the search parameters are resolved.
function AppointmentsLoading() {
  return (
    <main className="min-h-[50vh] bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <p className="text-sm font-medium text-muted">
          Loading your appointments...
        </p>
      </div>
    </main>
  );
}

export default function AppointmentsPage({
  searchParams,
}: AppointmentsPageProps) {
  return (
    <Suspense fallback={<AppointmentsLoading />}>
      <AppointmentsContent searchParams={searchParams} />
    </Suspense>
  );
}
