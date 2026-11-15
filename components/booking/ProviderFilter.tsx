import { Filter } from "lucide-react";

interface ProviderFilterProps {
  providers: string[];
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
}

export default function ProviderFilter({
  providers,
  selectedProvider,
  onProviderChange,
}: ProviderFilterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-xl font-bold text-primary">
          Available appointments
        </h2>

        <p className="mt-1 text-sm text-muted">
          Choose a provider and find a convenient appointment time.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Filter size={19} className="shrink-0 text-muted" />

        <label htmlFor="provider-filter" className="sr-only">
          Filter by healthcare provider
        </label>

        <select
          id="provider-filter"
          value={selectedProvider}
          onChange={(event) => onProviderChange(event.target.value)}
          className="min-h-11 w-full rounded-lg border border-border bg-white px-4 py-2.5 text-sm font-medium text-primary outline-none transition focus:border-secondary focus:ring-2 focus:ring-teal-100 sm:w-56"
        >
          <option value="">All providers</option>

          {providers.map((provider) => (
            <option key={provider} value={provider}>
              {provider}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
