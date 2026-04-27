"use client";

interface DashboardErrorProps {
  message: string;
}

export function DashboardError({ message }: DashboardErrorProps) {
  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-4 sm:space-y-6">
      <h2
        className="text-xl sm:text-2xl font-semibold"
        style={{ color: "var(--color-text)" }}
      >
        今日总览
      </h2>
      <div
        className="rounded-lg p-4 border"
        style={{
          backgroundColor: "var(--color-error-bg, rgba(239,68,68,0.1))",
          borderColor: "var(--color-error-border, rgba(239,68,68,0.3))",
        }}
      >
        <p className="text-sm" style={{ color: "var(--color-error)" }}>
          加载失败: {message}
        </p>
      </div>
    </div>
  );
}
