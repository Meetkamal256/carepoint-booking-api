import Link from "next/link";

type LogoProps = {
  compact?: boolean;
};

export default function Logo({ compact = false }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="CarePoint home"
      className="inline-flex items-center gap-2 shrink-0"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary text-white">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            d="M10 3.5h4v6.5h6.5v4H14v6.5h-4V14H3.5v-4H10V3.5Z"
            fill="currentColor"
          />
        </svg>
      </span>

      <span className="text-xl font-bold tracking-tight text-primary">
        Care<span className="text-secondary">Point</span>
      </span>

      {!compact && <span className="sr-only">Medical Clinic</span>}
    </Link>
  );
}
