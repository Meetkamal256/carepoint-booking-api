import { CalendarDays, ClipboardCheck, HeartPulse } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { homeFeatures, type HomeFeatureIcon } from "./home";

const featureIcons: Record<HomeFeatureIcon, LucideIcon> = {
  "calendar-days": CalendarDays,
  "clipboard-check": ClipboardCheck,
  "heart-pulse": HeartPulse,
};

export default function FeaturesSection() {
  return (
    <section className="bg-background px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-secondary">
            THE CAREPOINT EXPERIENCE
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            Healthcare booking without the hassle
          </h2>

          <p className="mt-4 leading-7 text-muted">
            We've made it easier to arrange and keep track of your clinic
            appointments.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {homeFeatures.map((feature) => {
            const Icon = featureIcons[feature.icon];

            return (
              <article
                key={feature.number}
                className="rounded-2xl border border-border bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-secondary">
                    <Icon size={25} strokeWidth={1.8} />
                  </div>

                  <span className="text-sm font-bold text-slate-300">
                    {feature.number}
                  </span>
                </div>

                <h3 className="mt-6 text-xl font-bold text-primary">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-muted">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
