"use client";

export function DashboardSkeleton() {
  const pulseClass = "animate-pulse rounded";

  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <div
        className={`${pulseClass} h-8 w-32`}
        style={{ backgroundColor: "var(--color-bg-hover)" }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${pulseClass} h-24`}
            style={{ backgroundColor: "var(--color-bg-hover)" }}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-7 gap-2">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className={`${pulseClass} h-16`}
            style={{ backgroundColor: "var(--color-bg-hover)" }}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${pulseClass} h-28`}
            style={{ backgroundColor: "var(--color-bg-hover)" }}
          />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`${pulseClass} h-36`}
            style={{ backgroundColor: "var(--color-bg-hover)" }}
          />
        ))}
      </div>
    </div>
  );
}
