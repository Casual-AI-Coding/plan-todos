interface ScrollIndicatorsProps {
  showTop: boolean;
  showBottom: boolean;
}

export function ScrollIndicators({
  showTop,
  showBottom,
}: ScrollIndicatorsProps) {
  return (
    <>
      {/* Top indicator */}
      <div
        className={`absolute top-0 left-0 right-0 h-14 pointer-events-none 
          scroll-indicator-fade-top transition-all duration-300 
          ${showTop ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}`}
      >
        <div className="flex flex-col items-center justify-start h-full pt-2">
          <svg
            className="w-5 h-5 text-gray-400 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 10l7-7m0 0l7 7m-7-7v18"
            />
          </svg>
        </div>
      </div>

      {/* Bottom indicator */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-14 pointer-events-none 
          scroll-indicator-fade-bottom transition-all duration-300 
          ${showBottom ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        <div className="flex flex-col items-center justify-end h-full pb-2">
          <svg
            className="w-5 h-5 text-gray-400 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </div>
    </>
  );
}
