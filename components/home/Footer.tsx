import Link from "next/link";
import CarePointLogo from "@/components/Logo";

const footerLinks = [
  { href: "/", label: "Home" },
  { href: "/book", label: "Book appointment" },
  { href: "/appointments", label: "My appointments" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div className="space-y-3">
          <CarePointLogo compact />
          <p className="max-w-sm text-sm leading-6 text-muted">
            Making clinic appointments simpler and more convenient.
          </p>
        </div>

        <nav
          aria-label="Footer navigation"
          className="flex flex-wrap gap-x-6 gap-y-3"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-secondary"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-5 text-sm text-muted sm:px-6 lg:px-8">
          © 2026 CarePoint. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
