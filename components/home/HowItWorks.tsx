import { ArrowRight } from "lucide-react";
import { howItWorksContent } from "./home";

export default function HowItWorks() {
  return (
    <section className="bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-bold uppercase tracking-widest text-secondary">
            {howItWorksContent.badge}
          </p>
          
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-primary sm:text-4xl">
            {howItWorksContent.heading}
          </h2>
        </div>

        <div className="mt-14 grid gap-10 md:grid-cols-3">
          {howItWorksContent.steps.map((step, index) => (
            <div key={step.number} className="relative text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-xl font-bold text-secondary">
                {step.number}
              </div>

              <h3 className="mt-5 text-lg font-bold text-primary">
                {step.title}
              </h3>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted">
                {step.description}
              </p>

              {index < howItWorksContent.steps.length - 1 && (
                <div className="pointer-events-none absolute -right-5 top-4 hidden text-slate-300 md:block">
                  <ArrowRight size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
