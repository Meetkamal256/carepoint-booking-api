import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { callToActionContent } from "./home";

export default function CallToAction() {
  return (
    <section className="bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center sm:px-12 sm:py-16">
        <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
          {callToActionContent.heading}
        </h2>

        <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-300">
          {callToActionContent.description}
        </p>

        <Link
          href="/book"
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-7 py-4 text-sm font-bold text-primary transition hover:bg-teal-50"
        >
          {callToActionContent.button}
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
