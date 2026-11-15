import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ShieldCheck,
} from "lucide-react";
import { heroContent } from "./home";

export default function HeroSection() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:py-24">
        {/* Hero content */}
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-secondary">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            {heroContent.badge}
          </div>

          <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight text-primary sm:text-5xl lg:text-6xl">
            {heroContent.heading}{" "}
            <span className="text-secondary">
              {heroContent.highlightedHeading}
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-base leading-8 text-muted sm:text-lg">
            {heroContent.description}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-secondary px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-teal-900/10 transition hover:bg-teal-700"
            >
              {heroContent.primaryButton}
              <ArrowRight size={18} />
            </Link>

            <Link
              href="/appointments"
              className="inline-flex items-center justify-center rounded-xl border border-border bg-white px-7 py-4 text-sm font-semibold text-primary transition hover:bg-slate-50"
            >
              {heroContent.secondaryButton}
            </Link>
          </div>

          <p className="mt-5 text-sm text-muted">{heroContent.note}</p>
        </div>

        {/* Decorative appointment illustration */}
        <div className="relative mx-auto w-full max-w-lg" aria-hidden="true">
          <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-teal-100/70 blur-3xl" />

          <div className="relative overflow-hidden rounded-[2rem] bg-primary p-5 sm:p-8">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border-[28px] border-white/10" />
            <div className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-secondary/30 blur-2xl" />

            <div className="relative rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-secondary">
                  <CalendarDays size={26} />
                </div>

                <div>
                  <p className="text-xs font-medium text-muted">WELCOME TO</p>
                  <p className="text-lg font-bold text-primary">CarePoint</p>
                </div>
              </div>

              <div className="mt-8">
                <p className="text-sm font-semibold text-secondary">
                  YOUR CARE JOURNEY
                </p>

                <h2 className="mt-2 text-2xl font-bold leading-snug text-primary">
                  A simpler way to manage your appointments.
                </h2>

                <p className="mt-3 text-sm leading-6 text-muted">
                  Everything you need to get started with your next appointment,
                  in one convenient place.
                </p>
              </div>

              <div className="mt-7 space-y-3">
                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-secondary">
                    <Clock3 size={21} />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-primary">
                      Flexible appointment search
                    </p>
                    <p className="text-xs text-muted">
                      Explore available times
                    </p>
                  </div>

                  <CheckCircle2 size={19} className="ml-auto text-secondary" />
                </div>

                <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-100 text-secondary">
                    <ShieldCheck size={21} />
                  </span>

                  <div>
                    <p className="text-sm font-semibold text-primary">
                      Convenient booking
                    </p>
                    <p className="text-xs text-muted">
                      Manage appointments online
                    </p>
                  </div>

                  <CheckCircle2 size={19} className="ml-auto text-secondary" />
                </div>
              </div>

              <div className="mt-6 border-t border-border pt-5 text-sm font-medium text-secondary">
                Simple. Convenient. Accessible.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
